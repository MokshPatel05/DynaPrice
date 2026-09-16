export interface PriceHistory {
  price: number;
  timestamp: number;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  basePrice: number;        // original price — never changes
  currentPrice: number;     // adjusts every 60-second tick
  viewCount: number;
  wishlistAddCount: number;
  cartAddCount: number;
  buyCount: number;
  priceHistory: PriceHistory[];
  lastChangePct: number | null;
}

// Shape for creating a new product
export interface ProductCreate {
  name: string;
  category: string;
  base_price: number;
}

// API shapes ----------------------------------------------------------------

export interface BatchRequestItem {
  id: string;
  view_count: number;
  wishlist_add_count: number;
  cart_add_count: number;
  buy_count: number;
}

export interface BatchResultItem {
  id: string;
  price_change_pct: number;
}

export interface BatchResponse {
  results: BatchResultItem[];
}

// API product response shape (snake_case from backend)
export interface ProductApiResponse {
  id: string;
  name: string;
  category: string;
  base_price: number;
  current_price: number;
  view_count: number;
  wishlist_add_count: number;
  cart_add_count: number;
  buy_count: number;
  last_change_pct: number | null;
  price_history: { price: number; timestamp: number }[];
}
