import type { Product } from '../types/product';

const PRODUCTS_KEY = 'dynaprice:products';
const LAST_TICK_KEY = 'dynaprice:lastTick';

export function loadProducts(): Product[] | null {
  try {
    const raw = localStorage.getItem(PRODUCTS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Product[];
  } catch {
    return null;
  }
}

export function saveProducts(products: Product[]): void {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

export function loadLastTick(): number | null {
  try {
    const raw = localStorage.getItem(LAST_TICK_KEY);
    if (!raw) return null;
    return parseInt(raw, 10);
  } catch {
    return null;
  }
}

export function saveLastTick(timestamp: number): void {
  localStorage.setItem(LAST_TICK_KEY, String(timestamp));
}
