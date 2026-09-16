"""
Pydantic schemas for DynaPrice request/response bodies.

All models use Pydantic v2 style (no orm_mode / class Config).

Security hardening:
- max_length on all free-text string fields (H4 fix)
- max_length on auth fields (H4 fix)
- max items on BatchRequest.products (M4 fix)
- price ceiling on base_price (H4 fix)
"""

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Single-product prediction
# ---------------------------------------------------------------------------

class PredictRequest(BaseModel):
    view_count: int = Field(default=0, ge=0, description="Number of product views")
    wishlist_add_count: int = Field(default=0, ge=0, description="Number of wishlist adds")
    cart_add_count: int = Field(default=0, ge=0, description="Number of cart adds")
    buy_count: int = Field(default=0, ge=0, description="Number of purchases")

    model_config = {"json_schema_extra": {"example": {
        "view_count": 10,
        "wishlist_add_count": 2,
        "cart_add_count": 4,
        "buy_count": 1,
    }}}


class PredictResponse(BaseModel):
    price_change_pct: float = Field(
        description="Predicted price change percentage, clamped to [-5, +5]"
    )


# ---------------------------------------------------------------------------
# Batch prediction
# ---------------------------------------------------------------------------

class BatchItem(BaseModel):
    id: str = Field(description="Caller-supplied product identifier (echoed back)", max_length=200)
    view_count: int = Field(default=0, ge=0)
    wishlist_add_count: int = Field(default=0, ge=0)
    cart_add_count: int = Field(default=0, ge=0)
    buy_count: int = Field(default=0, ge=0)


class BatchRequest(BaseModel):
    # max_length=500 prevents unbounded CPU use from huge batch calls (M4 fix)
    products: list[BatchItem] = Field(
        description="List of products to predict for",
        max_length=500,
    )

    model_config = {"json_schema_extra": {"example": {"products": [
        {"id": "p1", "view_count": 10, "wishlist_add_count": 2, "cart_add_count": 4, "buy_count": 1},
        {"id": "p2", "view_count": 3, "wishlist_add_count": 0, "cart_add_count": 1, "buy_count": 0},
    ]}}}


class BatchResultItem(BaseModel):
    id: str
    price_change_pct: float


class BatchResponse(BaseModel):
    results: list[BatchResultItem]


# ---------------------------------------------------------------------------
# Apply-price utility (optional endpoint for server-side price computation)
# ---------------------------------------------------------------------------

class ApplyPriceRequest(BaseModel):
    base_price: float = Field(gt=0, le=1_000_000, description="Original base price of the product")
    current_price: float = Field(gt=0, le=10_000_000, description="Current price before this tick")
    price_change_pct: float = Field(description="Predicted change percentage from the model")


class ApplyPriceResponse(BaseModel):
    new_price: float = Field(description="New price after applying change, floored at base_price")


# ---------------------------------------------------------------------------
# Authentication
# ---------------------------------------------------------------------------

class AuthRequest(BaseModel):
    # max_length prevents oversized payload attacks (H4 fix)
    email: str = Field(description="User's email address", max_length=255)
    password: str = Field(description="User's password", min_length=6, max_length=255)

class User(BaseModel):
    id: str
    email: str
    name: str
    is_demo: bool = False

class AuthResponse(BaseModel):
    token: str = Field(description="Signed JWT token")
    user: User


# ---------------------------------------------------------------------------
# Products
# ---------------------------------------------------------------------------

class PriceHistoryEntry(BaseModel):
    price: float
    timestamp: int  # Unix ms

class ProductOut(BaseModel):
    id: str
    name: str
    category: str
    base_price: float
    current_price: float
    view_count: int
    wishlist_add_count: int
    cart_add_count: int
    buy_count: int
    last_change_pct: float | None
    price_history: list[PriceHistoryEntry]

class ProductCreate(BaseModel):
    # max_length prevents DB flooding with huge strings (H4 fix)
    name: str = Field(min_length=1, max_length=200, description="Product name")
    category: str = Field(default="General", max_length=100, description="Product category")
    base_price: float = Field(gt=0, le=1_000_000, description="Starting/base price")

    model_config = {"json_schema_extra": {"example": {
        "name": "My Awesome Product",
        "category": "Electronics",
        "base_price": 99.99,
    }}}

class ProductCountsUpdate(BaseModel):
    view_count: int = Field(ge=0)
    wishlist_add_count: int = Field(ge=0)
    cart_add_count: int = Field(ge=0)
    buy_count: int = Field(ge=0)

class ProductPriceUpdate(BaseModel):
    current_price: float = Field(gt=0, le=10_000_000)
    last_change_pct: float
    recorded_at: int  # Unix ms timestamp
