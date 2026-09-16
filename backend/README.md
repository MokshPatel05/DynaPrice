# DynaPrice Backend

FastAPI backend that serves ML-powered dynamic pricing predictions.

## Prerequisites

- Python 3.11+

## Setup & Run

```bash
# 1. Create and activate a virtual environment
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Start the development server (from inside the backend/ folder)
uvicorn app.main:app --reload
```

The API will be available at **http://localhost:8000**.

## Interactive API Docs

Visit **http://localhost:8000/docs** (Swagger UI) to explore and test all endpoints directly in your browser — no frontend required.

## Endpoints

| Method | Path             | Description                                         |
|--------|------------------|-----------------------------------------------------|
| GET    | `/health`        | Liveness probe — returns `{"status": "ok"}`         |
| POST   | `/predict`       | Single-product price-change prediction              |
| POST   | `/predict/batch` | Batch prediction (used by frontend every 60 s)      |

## Model Artifacts

Both `.joblib` files live under `app/model/` and are loaded **once** at startup:

- `dynaprice_model.joblib` — trained `GradientBoostingRegressor`
- `dynaprice_model_features.joblib` — saved feature-column order

The feature order is always read from the saved list — it is never hardcoded in the route handlers.
