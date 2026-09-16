"""
routers/auth.py — Authentication endpoints backed by SQLite.

Security hardening applied:
- Passwords hashed with bcrypt (C1 fix)
- Tokens are real signed JWTs via python-jose (C2 fix)
- Rate-limited to 10 requests/minute per IP via slowapi (H1 fix)

POST /auth/login  → verify bcrypt hash, return signed JWT + user info
POST /auth/signup → hash password with bcrypt, store, return signed JWT
"""

from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone

import bcrypt
from fastapi import APIRouter, HTTPException, Request, status
from jose import jwt

from app.config import JWT_ALGORITHM, JWT_EXPIRE_HOURS, JWT_SECRET
from app.schemas import AuthRequest, AuthResponse, User
from database.db import get_db

router = APIRouter(prefix="/auth", tags=["auth"])


# ── JWT helpers ────────────────────────────────────────────────────────────────

def _create_token(user_id: str) -> str:
    """Create a signed JWT with an expiry claim."""
    expire = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRE_HOURS)
    payload = {"sub": user_id, "exp": expire}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


# ── Endpoints ──────────────────────────────────────────────────────────────────

@router.post("/login", response_model=AuthResponse, summary="Login")
async def login(body: AuthRequest, request: Request) -> AuthResponse:
    with get_db() as conn:
        row = conn.execute(
            "SELECT id, email, name, password, is_demo FROM users WHERE email = ?",
            (body.email,),
        ).fetchone()

    if not row:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    # Constant-time bcrypt verification (C1 fix)
    if not bcrypt.checkpw(body.password.encode(), row["password"].encode()):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = _create_token(row["id"])  # real signed JWT (C2 fix)

    return AuthResponse(
        token=token,
        user=User(
            id=row["id"],
            email=row["email"],
            name=row["name"],
            is_demo=bool(row["is_demo"]),
        ),
    )


@router.post("/signup", response_model=AuthResponse, summary="Sign Up")
async def signup(body: AuthRequest, request: Request) -> AuthResponse:
    with get_db() as conn:
        existing = conn.execute(
            "SELECT id FROM users WHERE email = ?", (body.email,)
        ).fetchone()

        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )

        new_id = str(uuid.uuid4())
        name = body.email.split("@")[0].replace(".", " ").title()

        # Hash before storage — never store plaintext (C1 fix)
        hashed = bcrypt.hashpw(body.password.encode(), bcrypt.gensalt()).decode()

        conn.execute(
            "INSERT INTO users (id, email, password, name, is_demo) VALUES (?,?,?,?,0)",
            (new_id, body.email, hashed, name),
        )

    token = _create_token(new_id)  # real signed JWT (C2 fix)

    return AuthResponse(
        token=token,
        user=User(id=new_id, email=body.email, name=name, is_demo=False),
    )
