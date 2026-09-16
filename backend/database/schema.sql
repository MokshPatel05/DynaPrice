-- DynaPrice SQLite Schema
-- This file is for documentation / reference only.
-- The actual database is created programmatically by db.py using CREATE TABLE IF NOT EXISTS.

-- ─── Users ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id          TEXT PRIMARY KEY,
    email       TEXT UNIQUE NOT NULL,
    password    TEXT NOT NULL,
    name        TEXT NOT NULL,
    is_demo     INTEGER NOT NULL DEFAULT 0,  -- 1 = seeded demo account
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── Products ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
    id                  TEXT PRIMARY KEY,
    user_id             TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name                TEXT NOT NULL,
    category            TEXT NOT NULL DEFAULT 'General',
    base_price          REAL NOT NULL,
    current_price       REAL NOT NULL,
    view_count          INTEGER NOT NULL DEFAULT 0,
    wishlist_add_count  INTEGER NOT NULL DEFAULT 0,
    cart_add_count      INTEGER NOT NULL DEFAULT 0,
    buy_count           INTEGER NOT NULL DEFAULT 0,
    last_change_pct     REAL,
    created_at          TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── Price History ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS price_history (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id  TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    price       REAL NOT NULL,
    recorded_at INTEGER NOT NULL  -- Unix timestamp (ms) to match frontend
);
