"""
routers/predict.py — Prediction endpoints for DynaPrice.

POST /predict        → single-product price-change prediction
POST /predict/batch  → batch prediction (used by the frontend every 60 s)
"""

from __future__ import annotations

import numpy as np
from fastapi import APIRouter, Request

from app.pricing import clamp_pct
from app.schemas import (
    BatchRequest,
    BatchResponse,
    BatchResultItem,
    PredictRequest,
    PredictResponse,
)

router = APIRouter(prefix="/predict", tags=["predict"])


def _predict_one(
    model,
    feature_names: list[str],
    view_count: int,
    wishlist_add_count: int,
    cart_add_count: int,
    buy_count: int,
) -> float:
    """
    Build a feature row using the *saved* feature order and run inference.

    The column order is taken from `feature_names` loaded at startup —
    it is never hardcoded here.
    """
    counts: dict[str, int] = {
        "view_count": view_count,
        "wishlist_add_count": wishlist_add_count,
        "cart_add_count": cart_add_count,
        "buy_count": buy_count,
    }
    # Build row in the exact order the model was trained on.
    row = np.array([[counts[f] for f in feature_names]], dtype=float)
    raw_pct: float = float(model.predict(row)[0])
    return clamp_pct(raw_pct)


# ---------------------------------------------------------------------------
# Single-product endpoint
# ---------------------------------------------------------------------------

@router.post("", response_model=PredictResponse, summary="Predict price change for one product")
async def predict_single(body: PredictRequest, request: Request) -> PredictResponse:
    """
    Accept one product's interest counts and return the predicted
    price-change percentage, clamped to [-5, +5].
    """
    pct = _predict_one(
        request.app.state.model,
        request.app.state.feature_names,
        body.view_count,
        body.wishlist_add_count,
        body.cart_add_count,
        body.buy_count,
    )
    return PredictResponse(price_change_pct=pct)


# ---------------------------------------------------------------------------
# Batch endpoint
# ---------------------------------------------------------------------------

@router.post(
    "/batch",
    response_model=BatchResponse,
    summary="Predict price changes for multiple products in one call",
)
async def predict_batch(body: BatchRequest, request: Request) -> BatchResponse:
    """
    Accept a list of products and return a price-change percentage for each,
    in the same order. The frontend calls this every 60 seconds.
    """
    results: list[BatchResultItem] = []
    for item in body.products:
        pct = _predict_one(
            request.app.state.model,
            request.app.state.feature_names,
            item.view_count,
            item.wishlist_add_count,
            item.cart_add_count,
            item.buy_count,
        )
        results.append(BatchResultItem(id=item.id, price_change_pct=pct))
    return BatchResponse(results=results)
