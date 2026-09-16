import type { BatchRequestItem, BatchResponse, BatchResultItem, ProductCreate, ProductApiResponse } from '../types/product';

// M3 fix: Use VITE_API_URL env variable instead of hardcoded localhost
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// ---------------------------------------------------------------------------
// Health
// ---------------------------------------------------------------------------

export async function healthCheck(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/health`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return false;
    const data = (await res.json()) as { status: string };
    return data.status === 'ok';
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Predictions
// ---------------------------------------------------------------------------

export async function predictBatch(items: BatchRequestItem[]): Promise<BatchResultItem[]> {
  const res = await fetch(`${BASE_URL}/predict/batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ products: items }),
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) {
    throw new Error(`Batch prediction failed: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as BatchResponse;
  return data.results;
}

// ---------------------------------------------------------------------------
// Auth API
// ---------------------------------------------------------------------------

function extractErrorMessage(errorData: any, fallback: string): string {
  const detail = errorData?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail) && detail.length > 0 && typeof detail[0]?.msg === 'string') {
    return detail[0].msg;
  }
  return fallback;
}

export async function login(email: string, password: string) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(extractErrorMessage(errorData, 'Login failed'));
  }

  return res.json();
}

export async function signup(email: string, password: string) {
  const res = await fetch(`${BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(extractErrorMessage(errorData, 'Signup failed'));
  }

  return res.json();
}

// ---------------------------------------------------------------------------
// Products API (all require Bearer token)
// ---------------------------------------------------------------------------

function authHeaders(token: string): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export async function fetchProducts(token: string): Promise<ProductApiResponse[]> {
  const res = await fetch(`${BASE_URL}/products`, {
    headers: authHeaders(token),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Failed to load products: ${res.status}`);
  return res.json() as Promise<ProductApiResponse[]>;
}

export async function createProduct(token: string, data: ProductCreate): Promise<ProductApiResponse> {
  const res = await fetch(`${BASE_URL}/products`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(data),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(extractErrorMessage(err, 'Failed to create product'));
  }
  return res.json() as Promise<ProductApiResponse>;
}

export async function deleteProduct(token: string, productId: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/products/${productId}`, {
    method: 'DELETE',
    headers: authHeaders(token),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Failed to delete product: ${res.status}`);
}

export async function syncCounts(
  token: string,
  productId: string,
  counts: { view_count: number; wishlist_add_count: number; cart_add_count: number; buy_count: number }
): Promise<void> {
  // Fire-and-forget: we don't block the UI on this
  fetch(`${BASE_URL}/products/${productId}/counts`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify(counts),
  }).catch(() => { /* silently ignore if offline */ });
}

export async function syncPrice(
  token: string,
  productId: string,
  data: { current_price: number; last_change_pct: number; recorded_at: number }
): Promise<void> {
  fetch(`${BASE_URL}/products/${productId}/price`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  }).catch(() => { /* silently ignore if offline */ });
}
