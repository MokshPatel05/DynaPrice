"""
DynaPrice Backend — FastAPI app entry point.

Security hardening applied:
- slowapi rate limiting (H1 fix)
- Tightened CORS: specific methods/headers, allow_credentials=True (M1, M5 fix)
- Docs disabled in production via ENVIRONMENT env var (L2 fix)
- SecurityHeadersMiddleware adds CSP, X-Frame-Options, X-Content-Type-Options (L4 fix)
- Price history pruned on startup (L3 fix — also runs in db.init_db)
"""

from contextlib import asynccontextmanager
from pathlib import Path

import joblib
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from slowapi.util import get_remote_address

from app.config import IS_PRODUCTION
from app.routers import predict, auth, products
from database.db import init_db

MODEL_DIR = Path(__file__).parent / "model"

# ── Rate limiter (H1 fix) ──────────────────────────────────────────────────────
limiter = Limiter(key_func=get_remote_address, default_limits=["200/minute"])


# ── Lifespan ───────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load ML artifacts and initialise the SQLite DB once on startup."""
    app.state.model = joblib.load(MODEL_DIR / "dynaprice_model.joblib")
    app.state.feature_names: list[str] = joblib.load(
        MODEL_DIR / "dynaprice_model_features.joblib"
    )
    app.state.limiter = limiter

    # Database: create tables + seed demo users/products + prune old history
    init_db()

    yield


# ── FastAPI app ────────────────────────────────────────────────────────────────

app = FastAPI(
    title="DynaPrice API",
    description="ML-powered dynamic pricing predictions for the DynaPrice demo.",
    version="2.0.0",
    lifespan=lifespan,
    # Disable interactive docs in production (L2 fix)
    docs_url=None if IS_PRODUCTION else "/docs",
    redoc_url=None if IS_PRODUCTION else "/redoc",
)

# ── Rate limiting middleware (H1 fix) ──────────────────────────────────────────
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)


# ── Security headers middleware (L4 fix) ───────────────────────────────────────
@app.middleware("http")
async def security_headers_middleware(request: Request, call_next) -> Response:
    response = await call_next(request)
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline'; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
        "font-src 'self' https://fonts.gstatic.com; "
        "img-src 'self' data:; "
        "connect-src 'self' http://localhost:8000;"
    )
    return response


# ── CORS (M1, M5 fix) ─────────────────────────────────────────────────────────
# - Restricted to specific methods and headers
# - Allow localhost for dev and *.onrender.com for production deployment
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?|https?://.*\.onrender\.com",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)


# ── Routers ────────────────────────────────────────────────────────────────────
app.include_router(predict.router)
app.include_router(auth.router)
app.include_router(products.router)


# ── Health check ───────────────────────────────────────────────────────────────
@app.get("/health", tags=["health"])
async def health() -> dict[str, str]:
    """Simple liveness probe the frontend polls on load."""
    return {"status": "ok"}
