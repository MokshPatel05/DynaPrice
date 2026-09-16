"""
routers/products.py — Per-user product CRUD endpoints backed by SQLite.

All endpoints require a valid signed JWT in the Authorization header.
Token is verified with python-jose against the app's JWT_SECRET (C2 fix).

GET    /products              → list products for the current user
POST   /products              → create a new product
PATCH  /products/{id}/counts  → update interest counts after simulate
PATCH  /products/{id}/price   → update price + append history after a tick
DELETE /products/{id}         → remove a product
"""

from __future__ import annotations

import time
import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, Header, HTTPException, status
from jose import JWTError, jwt

from app.config import JWT_ALGORITHM, JWT_SECRET
from app.schemas import (
    ProductCountsUpdate,
    ProductCreate,
    ProductOut,
    ProductPriceUpdate,
    PriceHistoryEntry,
)
from database.db import get_db

router = APIRouter(prefix="/products", tags=["products"])


# ── Auth dependency ────────────────────────────────────────────────────────────

def _get_user_id(authorization: Annotated[str | None, Header()] = None) -> str:
    """Verify the signed JWT and extract the user_id from the 'sub' claim (C2 fix)."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Missing or invalid authorization token",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if not authorization or not authorization.startswith("Bearer "):
        raise credentials_exception

    token = authorization.removeprefix("Bearer ")

    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id: str | None = payload.get("sub")
        if not user_id:
            raise credentials_exception
        return user_id
    except JWTError:
        raise credentials_exception


UserIdDep = Annotated[str, Depends(_get_user_id)]


# ── Helper ─────────────────────────────────────────────────────────────────────

def _fetch_products_for_user(user_id: str) -> list[ProductOut]:
    """Load all products + their price histories from the DB for one user."""
    with get_db() as conn:
        rows = conn.execute(
            """SELECT id, name, category, base_price, current_price,
                      view_count, wishlist_add_count, cart_add_count,
                      buy_count, last_change_pct
               FROM products WHERE user_id = ?
               ORDER BY created_at ASC""",
            (user_id,),
        ).fetchall()

        products: list[ProductOut] = []
        for row in rows:
            history_rows = conn.execute(
                "SELECT price, recorded_at FROM price_history WHERE product_id = ? ORDER BY recorded_at ASC",
                (row["id"],),
            ).fetchall()

            products.append(
                ProductOut(
                    id=row["id"],
                    name=row["name"],
                    category=row["category"],
                    base_price=row["base_price"],
                    current_price=row["current_price"],
                    view_count=row["view_count"],
                    wishlist_add_count=row["wishlist_add_count"],
                    cart_add_count=row["cart_add_count"],
                    buy_count=row["buy_count"],
                    last_change_pct=row["last_change_pct"],
                    price_history=[
                        PriceHistoryEntry(price=h["price"], timestamp=h["recorded_at"])
                        for h in history_rows
                    ],
                )
            )
    return products


# ── Endpoints ──────────────────────────────────────────────────────────────────

@router.get("", response_model=list[ProductOut], summary="List products for current user")
async def list_products(user_id: UserIdDep) -> list[ProductOut]:
    return _fetch_products_for_user(user_id)


@router.post("", response_model=ProductOut, status_code=201, summary="Create a new product")
async def create_product(body: ProductCreate, user_id: UserIdDep) -> ProductOut:
    product_id = str(uuid.uuid4())
    now_ms = int(time.time() * 1000)

    with get_db() as conn:
        # Check user exists
        if not conn.execute("SELECT 1 FROM users WHERE id = ?", (user_id,)).fetchone():
            raise HTTPException(status_code=404, detail="User not found")

        conn.execute(
            """INSERT INTO products (id, user_id, name, category, base_price, current_price)
               VALUES (?,?,?,?,?,?)""",
            (product_id, user_id, body.name, body.category, body.base_price, body.base_price),
        )
        conn.execute(
            "INSERT INTO price_history (product_id, price, recorded_at) VALUES (?,?,?)",
            (product_id, body.base_price, now_ms),
        )

    return ProductOut(
        id=product_id,
        name=body.name,
        category=body.category,
        base_price=body.base_price,
        current_price=body.base_price,
        view_count=0,
        wishlist_add_count=0,
        cart_add_count=0,
        buy_count=0,
        last_change_pct=None,
        price_history=[PriceHistoryEntry(price=body.base_price, timestamp=now_ms)],
    )


@router.patch("/{product_id}/counts", response_model=ProductOut,
              summary="Sync interest counts to DB after simulate")
async def update_counts(
    product_id: str, body: ProductCountsUpdate, user_id: UserIdDep
) -> ProductOut:
    with get_db() as conn:
        row = conn.execute(
            "SELECT user_id FROM products WHERE id = ?", (product_id,)
        ).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Product not found")
        if row["user_id"] != user_id:
            raise HTTPException(status_code=403, detail="Not your product")

        conn.execute(
            """UPDATE products
               SET view_count=?, wishlist_add_count=?, cart_add_count=?, buy_count=?
               WHERE id=?""",
            (body.view_count, body.wishlist_add_count, body.cart_add_count,
             body.buy_count, product_id),
        )

    return next(p for p in _fetch_products_for_user(user_id) if p.id == product_id)


@router.patch("/{product_id}/price", response_model=ProductOut,
              summary="Apply a tick price update and record history")
async def update_price(
    product_id: str, body: ProductPriceUpdate, user_id: UserIdDep
) -> ProductOut:
    with get_db() as conn:
        row = conn.execute(
            "SELECT user_id FROM products WHERE id = ?", (product_id,)
        ).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Product not found")
        if row["user_id"] != user_id:
            raise HTTPException(status_code=403, detail="Not your product")

        conn.execute(
            "UPDATE products SET current_price=?, last_change_pct=?, view_count=0, wishlist_add_count=0, cart_add_count=0, buy_count=0 WHERE id=?",
            (body.current_price, body.last_change_pct, product_id),
        )
        conn.execute(
            "INSERT INTO price_history (product_id, price, recorded_at) VALUES (?,?,?)",
            (product_id, body.current_price, body.recorded_at),
        )

    return next(p for p in _fetch_products_for_user(user_id) if p.id == product_id)


@router.delete("/{product_id}", status_code=204, summary="Delete a product")
async def delete_product(product_id: str, user_id: UserIdDep) -> None:
    with get_db() as conn:
        row = conn.execute(
            "SELECT user_id FROM products WHERE id = ?", (product_id,)
        ).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Product not found")
        if row["user_id"] != user_id:
            raise HTTPException(status_code=403, detail="Not your product")

        conn.execute("DELETE FROM products WHERE id = ?", (product_id,))
