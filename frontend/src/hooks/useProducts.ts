import { useState, useCallback, useRef, useEffect } from 'react';
import type { Product, ProductApiResponse, ProductCreate } from '../types/product';
import { saveLastTick } from '../lib/storage';
import {
  fetchProducts as apiFetchProducts,
  createProduct as apiCreateProduct,
  deleteProduct as apiDeleteProduct,
  predictBatch,
  syncCounts,
  syncPrice,
} from '../lib/api';

const FLASH_DURATION_MS = 700;

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Convert backend snake_case response to frontend camelCase Product */
function toProduct(p: ProductApiResponse): Product {
  return {
    id: p.id,
    name: p.name,
    category: p.category,
    basePrice: p.base_price,
    currentPrice: p.current_price,
    viewCount: p.view_count,
    wishlistAddCount: p.wishlist_add_count,
    cartAddCount: p.cart_add_count,
    buyCount: p.buy_count,
    lastChangePct: p.last_change_pct,
    priceHistory: p.price_history,
  };
}

/** Apply price-change % with base-price floor */
function applyPriceChange(current: number, base: number, pct: number): number {
  return Math.max(current * (1 + pct / 100), base);
}

interface UseProductsReturn {
  products: Product[];
  flashingIds: ReadonlySet<string>;
  isLoading: boolean;
  simulateActivity: () => void;
  runPriceTick: () => Promise<void>;
  addProduct: (data: ProductCreate) => Promise<void>;
  removeProduct: (id: string) => Promise<void>;
  incrementStat: (id: string, field: 'viewCount' | 'wishlistAddCount' | 'cartAddCount' | 'buyCount') => void;
  reload: () => Promise<void>;
}

export function useProducts(token: string | null): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [flashingIds, setFlashingIds] = useState<ReadonlySet<string>>(new Set());
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Load from API on mount ─────────────────────────────────────────────────
  const reload = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const data = await apiFetchProducts(token);
      setProducts(data.map(toProduct));
    } catch {
      // Silently fail — backend may not be up yet
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void reload();
  }, [reload]);

  // ── Simulate activity ──────────────────────────────────────────────────────
  const simulateActivity = useCallback(() => {
    const updatedIds = new Set<string>();

    setProducts((prev) => {
      const next = prev.map((p) => {
        if (Math.random() > 0.5) return p; // ~50% products affected
        updatedIds.add(p.id);

        const newCounts = {
          view_count: p.viewCount + rand(1, 5),
          wishlist_add_count: p.wishlistAddCount + (Math.random() < 0.4 ? rand(1, 2) : 0),
          cart_add_count: p.cartAddCount + (Math.random() < 0.4 ? rand(1, 2) : 0),
          buy_count: p.buyCount + (Math.random() < 0.15 ? 1 : 0),
        };

        // Persist counts to DB (fire-and-forget)
        if (token) syncCounts(token, p.id, newCounts);

        return {
          ...p,
          viewCount: newCounts.view_count,
          wishlistAddCount: newCounts.wishlist_add_count,
          cartAddCount: newCounts.cart_add_count,
          buyCount: newCounts.buy_count,
        };
      });

      // Flash updated cards
      setFlashingIds(updatedIds);
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
      flashTimerRef.current = setTimeout(() => setFlashingIds(new Set()), FLASH_DURATION_MS);

      return next;
    });
  }, [token]);

  // ── Price tick ─────────────────────────────────────────────────────────────
  const runPriceTick = useCallback(async () => {
    const items = products.map((p) => ({
      id: p.id,
      view_count: p.viewCount,
      wishlist_add_count: p.wishlistAddCount,
      cart_add_count: p.cartAddCount,
      buy_count: p.buyCount,
    }));

    const results = await predictBatch(items);
    const resultMap = new Map(results.map((r) => [r.id, r.price_change_pct]));
    const now = Date.now();

    setProducts((prev) =>
      prev.map((p) => {
        const pct = resultMap.get(p.id);
        if (pct === undefined) return p;
        const newPrice = applyPriceChange(p.currentPrice, p.basePrice, pct);

        // Persist to DB (fire-and-forget)
        if (token) {
          syncPrice(token, p.id, {
            current_price: newPrice,
            last_change_pct: pct,
            recorded_at: now,
          });
        }

        return {
          ...p,
          currentPrice: newPrice,
          lastChangePct: pct,
          priceHistory: [...p.priceHistory, { price: newPrice, timestamp: now }],
          viewCount: 0,
          wishlistAddCount: 0,
          cartAddCount: 0,
          buyCount: 0,
        };
      }),
    );

    saveLastTick(now);
  }, [products, token]);

  // ── Add product ────────────────────────────────────────────────────────────
  const addProduct = useCallback(async (data: ProductCreate) => {
    if (!token) return;
    const created = await apiCreateProduct(token, data);
    setProducts((prev) => [...prev, toProduct(created)]);
  }, [token]);

  // ── Remove product ─────────────────────────────────────────────────────────
  const removeProduct = useCallback(async (id: string) => {
    if (!token) return;
    await apiDeleteProduct(token, id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, [token]);

  // ── Increment manual stat ──────────────────────────────────────────────────
  const incrementStat = useCallback((id: string, field: 'viewCount' | 'wishlistAddCount' | 'cartAddCount' | 'buyCount') => {
    setProducts((prev) => {
      const next = prev.map((p) => {
        if (p.id !== id) return p;

        const newValue = p[field] + 1;
        const updatedProduct = { ...p, [field]: newValue };

        // Persist counts to DB (fire-and-forget)
        if (token) {
          syncCounts(token, p.id, {
            view_count: updatedProduct.viewCount,
            wishlist_add_count: updatedProduct.wishlistAddCount,
            cart_add_count: updatedProduct.cartAddCount,
            buy_count: updatedProduct.buyCount,
          });
        }

        return updatedProduct;
      });
      return next;
    });
  }, [token]);

  return { products, flashingIds, isLoading, simulateActivity, runPriceTick, addProduct, removeProduct, incrementStat, reload };
}
