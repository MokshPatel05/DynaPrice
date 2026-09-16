"""
pricing.py — Pure pricing business logic for DynaPrice.

Keep all price math here so it's independently testable without spinning
up the full FastAPI app.
"""

_PCT_MIN: float = -5.0
_PCT_MAX: float = 5.0


def clamp_pct(pct: float) -> float:
    """
    Clamp a raw model output to the valid training range [-5.0, +5.0].

    The GradientBoostingRegressor can extrapolate beyond its training
    range on unusual inputs, so we hard-clamp before using the value.

    Args:
        pct: Raw price-change percentage from the model.

    Returns:
        Clamped value in [-5.0, +5.0].
    """
    return max(_PCT_MIN, min(_PCT_MAX, pct))


def apply_price_change(
    current_price: float,
    base_price: float,
    price_change_pct: float,
) -> float:
    """
    Apply a price-change percentage to the current price, then enforce
    the base-price floor rule and the 1.5x price ceiling rule:

        new_price = current_price * (1 + price_change_pct / 100)
        new_price = max(new_price, base_price)     # never drop below base
        new_price = min(new_price, base_price * 1.5) # never exceed 50% increase

    The limits are enforced server-side here so it's consistent regardless
    of what client calls this logic.

    Args:
        current_price:    The product's price before this tick.
        base_price:       The product's original/minimum price.
        price_change_pct: Predicted change percentage (already clamped).

    Returns:
        The new price, constrained between base_price and base_price * 1.5.
    """
    new_price = current_price * (1.0 + price_change_pct / 100.0)
    return min(max(new_price, base_price), base_price * 1.5)
