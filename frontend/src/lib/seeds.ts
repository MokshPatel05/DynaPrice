import type { Product } from '../types/product';

/** 6 seed products across 3 categories with small random starting counts. */
function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function createSeedProducts(): Product[] {
  const now = Date.now();

  const seeds: Omit<Product, 'viewCount' | 'wishlistAddCount' | 'cartAddCount' | 'buyCount' | 'priceHistory' | 'lastChangePct'>[] = [
    { id: 'p1', name: 'Wireless Noise-Cancelling Headphones', category: 'Electronics', basePrice: 149.99, currentPrice: 149.99 },
    { id: 'p2', name: 'Mechanical Gaming Keyboard', category: 'Electronics', basePrice: 89.99, currentPrice: 89.99 },
    { id: 'p3', name: 'Premium Leather Sneakers', category: 'Fashion', basePrice: 119.99, currentPrice: 119.99 },
    { id: 'p4', name: 'Oversized Vintage Hoodie', category: 'Fashion', basePrice: 64.99, currentPrice: 64.99 },
    { id: 'p5', name: 'Ceramic Pour-Over Coffee Set', category: 'Home', basePrice: 54.99, currentPrice: 54.99 },
    { id: 'p6', name: 'Bamboo Desk Organizer', category: 'Home', basePrice: 34.99, currentPrice: 34.99 },
  ];

  return seeds.map((s) => ({
    ...s,
    viewCount: rand(0, 8),
    wishlistAddCount: rand(0, 3),
    cartAddCount: rand(0, 2),
    buyCount: rand(0, 1),
    priceHistory: [{ price: s.basePrice, timestamp: now }],
    lastChangePct: null,
  }));
}
