"""
app/config.py — Centralised configuration for DynaPrice.

Reads JWT_SECRET from the environment. Falls back to a randomly-generated
secret so the app "just works" in local dev without any .env setup.
In production, always set JWT_SECRET as an environment variable.
"""

from __future__ import annotations

import os
import secrets

# ── JWT ───────────────────────────────────────────────────────────────────────

# Pull from env; fall back to a random secret (changes on every restart — fine for dev)
JWT_SECRET: str = os.getenv("JWT_SECRET", secrets.token_hex(32))
JWT_ALGORITHM: str = "HS256"
JWT_EXPIRE_HOURS: int = int(os.getenv("JWT_EXPIRE_HOURS", "8"))

# ── Environment ───────────────────────────────────────────────────────────────

# Set ENVIRONMENT=production in your deployment environment to:
#   - Disable Swagger /docs and /redoc
ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
IS_PRODUCTION: bool = ENVIRONMENT == "production"
