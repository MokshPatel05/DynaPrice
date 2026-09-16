"""
database/db.py — SQLite connection helpers and database initialisation.

Uses Python's built-in sqlite3 so no extra pip packages are needed.
The database file lives at:  backend/database/dynaprice.db

Security:
- Demo user passwords are hashed with bcrypt at seed time.
- Demo user IDs are stable UUIDs (not predictable sequential strings).
"""

from __future__ import annotations

import sqlite3
import time
from contextlib import contextmanager
from pathlib import Path

import bcrypt

DB_PATH = Path(__file__).parent / "dynaprice.db"

# ── Connection ────────────────────────────────────────────────────────────────

@contextmanager
def get_db():
    """Yield a sqlite3 connection with row_factory set and WAL mode enabled."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row          # rows behave like dicts
    conn.execute("PRAGMA journal_mode=WAL") # better concurrent read performance
    conn.execute("PRAGMA foreign_keys=ON")  # enforce FK constraints
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


# ── Schema creation ───────────────────────────────────────────────────────────

def _create_tables(conn: sqlite3.Connection) -> None:
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id          TEXT PRIMARY KEY,
            email       TEXT UNIQUE NOT NULL,
            password    TEXT NOT NULL,
            name        TEXT NOT NULL,
            is_demo     INTEGER NOT NULL DEFAULT 0,
            created_at  TEXT NOT NULL DEFAULT (datetime('now'))
        );

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

        CREATE TABLE IF NOT EXISTS price_history (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id  TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
            price       REAL NOT NULL,
            recorded_at INTEGER NOT NULL
        );
    """)


# ── Demo seed data ─────────────────────────────────────────────────────────────

# Fixed stable UUIDs for demo users (not sequential/predictable — fixes H2)
_DEMO_USERS = [
    {"id": "a1b2c3d4-e5f6-7890-abcd-ef1234567801", "email": "demo1@dynaprice.com", "password": "password123", "name": "Demo User 1"},
    {"id": "a1b2c3d4-e5f6-7890-abcd-ef1234567802", "email": "demo2@dynaprice.com", "password": "password123", "name": "Demo User 2"},
    {"id": "a1b2c3d4-e5f6-7890-abcd-ef1234567803", "email": "demo3@dynaprice.com", "password": "password123", "name": "Demo User 3"},
]

_DEMO_PRODUCTS = [
    {"id": "dp1", "name": "Wireless Noise-Cancelling Headphones", "category": "Electronics", "base_price": 149.99},
    {"id": "dp2", "name": "Mechanical Gaming Keyboard",           "category": "Electronics", "base_price": 89.99},
    {"id": "dp3", "name": "Premium Leather Sneakers",             "category": "Fashion",     "base_price": 119.99},
    {"id": "dp4", "name": "Oversized Vintage Hoodie",             "category": "Fashion",     "base_price": 64.99},
    {"id": "dp5", "name": "Ceramic Pour-Over Coffee Set",         "category": "Home",        "base_price": 54.99},
    {"id": "dp6", "name": "Bamboo Desk Organizer",                "category": "Home",        "base_price": 34.99},
    {"id": "dp7", "name": "Smart Fitness Watch",                  "category": "Electronics", "base_price": 199.99},
    {"id": "dp8", "name": "Portable Bluetooth Speaker",           "category": "Electronics", "base_price": 59.99},
    {"id": "dp9", "name": "Minimalist Designer Backpack",         "category": "Fashion",     "base_price": 85.00},
    {"id": "dp10", "name": "Polarized Aviator Sunglasses",        "category": "Fashion",     "base_price": 45.00},
    {"id": "dp11", "name": "Ergonomic Office Chair",              "category": "Home",        "base_price": 249.99},
    {"id": "dp12", "name": "Adjustable Standing Desk",            "category": "Home",        "base_price": 399.00},
    {"id": "dp13", "name": "4K Ultra HD Monitor",                 "category": "Electronics", "base_price": 329.99},
    {"id": "dp14", "name": "Wireless Charging Pad",               "category": "Electronics", "base_price": 29.99},
    {"id": "dp15", "name": "Denim Trucker Jacket",                "category": "Fashion",     "base_price": 79.99},
    {"id": "dp16", "name": "Classic Canvas Sneakers",             "category": "Fashion",     "base_price": 55.00},
    {"id": "dp17", "name": "Linen Throw Pillow Set",              "category": "Home",        "base_price": 42.00},
    {"id": "dp18", "name": "Aromatherapy Essential Oil Diffuser", "category": "Home",        "base_price": 39.99},
]


def _hash_password(plain: str) -> str:
    """Return a bcrypt hash of the given plaintext password."""
    return bcrypt.hashpw(plain.encode(), bcrypt.gensalt()).decode()


def _seed_demo_data(conn: sqlite3.Connection) -> None:
    """Insert demo users and their shared product catalogue if not already present."""
    now_ms = int(time.time() * 1000)

    for u in _DEMO_USERS:
        # Check if user already exists
        existing = conn.execute(
            "SELECT password FROM users WHERE id = ?", (u["id"],)
        ).fetchone()

        if not existing:
            # Hash the demo password before storing (fixes C1)
            hashed = _hash_password(u["password"])
            conn.execute(
                "INSERT OR IGNORE INTO users (id, email, password, name, is_demo) VALUES (?,?,?,?,1)",
                (u["id"], u["email"], hashed, u["name"]),
            )

        # Seed products for this demo user (one copy per user)
        for p in _DEMO_PRODUCTS:
            product_id = f"{p['id']}_{u['id']}"  # unique per user
            exists = conn.execute(
                "SELECT 1 FROM products WHERE id = ?", (product_id,)
            ).fetchone()
            if not exists:
                conn.execute(
                    """INSERT INTO products
                       (id, user_id, name, category, base_price, current_price)
                       VALUES (?,?,?,?,?,?)""",
                    (product_id, u["id"], p["name"], p["category"],
                     p["base_price"], p["base_price"]),
                )
                # Seed the initial price history entry
                conn.execute(
                    "INSERT INTO price_history (product_id, price, recorded_at) VALUES (?,?,?)",
                    (product_id, p["base_price"], now_ms),
                )


def prune_old_price_history(conn: sqlite3.Connection, days: int = 7) -> None:
    """Delete price_history rows older than `days` days (fixes L3)."""
    cutoff_ms = int((time.time() - days * 86400) * 1000)
    conn.execute("DELETE FROM price_history WHERE recorded_at < ?", (cutoff_ms,))


# ── Public init function ───────────────────────────────────────────────────────

def init_db() -> None:
    """Create tables, seed demo data, and prune old history. Call once at startup."""
    with get_db() as conn:
        _create_tables(conn)
        _seed_demo_data(conn)
        prune_old_price_history(conn)
