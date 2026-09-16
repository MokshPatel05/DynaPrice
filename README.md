# DynaPrice: ML-Powered Dynamic Pricing Engine

![DynaPrice Banner](https://img.shields.io/badge/Status-Production_Ready-brightgreen) ![Python](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi) ![React](https://img.shields.io/badge/Frontend-React_Vite-61DAFB?logo=react) ![SQLite](https://img.shields.io/badge/Database-SQLite-003B57?logo=sqlite) ![Machine Learning](https://img.shields.io/badge/ML-Scikit_Learn-F7931E?logo=scikitlearn)

DynaPrice is a full-stack, machine learning-driven e-commerce simulation platform. It autonomously predicts and adjusts product prices in real-time based on live shopper engagement metrics (views, wishlist additions, cart additions, and purchases).

Built with a highly secure **FastAPI** backend, a responsive **React (Vite)** frontend styled in a bold Neo-Brutalist design language, and powered by a **Gradient Boosting Regressor** model, DynaPrice demonstrates the end-to-end integration of predictive AI into modern web architecture.

---

## 🚀 Core Features

- **Algorithmic Pricing Engine:** An integrated `scikit-learn` Gradient Boosting model continuously ingests shopper activity to predict optimal price changes every 60 seconds.
- **Real-Time Data Simulation:** Includes a built-in event simulator allowing users to instantly generate synthetic shopper traffic, watching the ML model react to sudden spikes in demand.
- **Interactive Neo-Brutalist UI:** A striking, highly tactile frontend where every metric is interactive. Users can manually click on product stats (👁️ Views, ❤️ Wishlist, 🛒 Cart, ✅ Buys) to manually influence the algorithm's next prediction tick.
- **Persistent Price Histories:** Every price fluctuation is recorded and visualized via custom sparklines on each product card, providing a historical view of the algorithm's decisions.
- **Enterprise-Grade Security:** Comprehensive security hardening across the entire stack, preventing modern web vulnerabilities (details below).

---

## 🛡️ Security Architecture

This platform was built with a "Security-First" mindset, implementing industry-standard defenses:

* **Authentication & Authorization:** 
  * Real, stateless **JWT (JSON Web Tokens)** via `python-jose`, signed with HMAC (`HS256`).
  * Passwords securely hashed with **bcrypt** (constant-time verification).
  * Strict IDOR (Insecure Direct Object Reference) prevention on all database transactions.
* **Rate Limiting & Traffic Control:**
  * Global rate limiting implemented via `slowapi` to prevent brute-force and DDoS attacks.
  * Hard limits on batch-prediction payload sizes to prevent ML-compute exhaustion.
* **Data Integrity & Validation:**
  * Rigorous `Pydantic v2` schemas enforcing boundaries (e.g., maximum string lengths, strict numerical floors/ceilings).
  * 100% Parameterized SQL queries via SQLite, eliminating SQL Injection risks.
* **Network & Browser Security:**
  * Strict CORS policies (restricted methods, localized origins, explicit header allowances).
  * `SecurityHeadersMiddleware` enforcing `Content-Security-Policy`, `X-Frame-Options (DENY)`, and `X-Content-Type-Options (nosniff)`.

---

## 🛠️ Technology Stack

### Backend (Python)
- **Framework:** FastAPI, Uvicorn
- **Machine Learning:** Scikit-Learn, Numpy, Joblib
- **Database:** SQLite3 (WAL mode enabled for concurrent reads)
- **Security:** Bcrypt, Python-JOSE, SlowAPI

### Frontend (TypeScript)
- **Framework:** React 18, Vite
- **Routing & State:** React Router DOM, Custom React Hooks
- **Styling:** TailwindCSS (Custom Neo-Brutalist configuration)
- **Notifications:** React Hot Toast

---

## ⚙️ Local Setup Instructions

Running the project requires two terminals (one for the API, one for the UI).

### 1. Start the Backend (Terminal 1)

```bash
cd dynaprice/backend

# Create and activate a Python virtual environment
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate

# Install all required dependencies
pip install -r requirements.txt

# Start the FastAPI server (will auto-seed the database on startup)
uvicorn app.main:app --reload
```
*The API will be live at `http://localhost:8000`.*

### 2. Start the Frontend (Terminal 2)

```bash
cd dynaprice/frontend

# Install Node modules
npm install

# Start the Vite development server
npm run dev
```
*The UI will be live at `http://localhost:5173`.*

---

## 🎮 How to Use the Platform

1. **Sign Up / Log In:** Create a new account or tap "Fill with Demo User" to load pre-seeded e-commerce data.
2. **Dashboard Overview:** You will see a live grid of products. A global countdown timer dictates when the ML model will run its next batch prediction.
3. **Generate Traffic:** Click **"⚡ Simulate Shoppers"** in the top navigation bar to generate random organic traffic across your catalogue.
4. **Manual Override:** Click directly on any product's metric labels (Views, Cart, etc.) to artificially inflate interest for that specific item.
5. **Watch the ML React:** When the 60-second timer hits zero, the frontend sends the aggregated data to the FastAPI prediction endpoint. Watch the prices update dynamically and the sparkline graphs plot the new data points!

---

## 📂 Project Structure

```text
dynaprice/
├── backend/
│   ├── app/
│   │   ├── model/         # Pre-trained GradientBoostingRegressor (.joblib)
│   │   ├── routers/       # Endpoints (auth.py, products.py, predict.py)
│   │   ├── config.py      # Environment variables & secrets management
│   │   ├── main.py        # FastAPI entry, CORS, Rate Limiting, CSP Headers
│   │   ├── pricing.py     # Deterministic mathematical bounds for ML outputs
│   │   └── schemas.py     # Pydantic validation schemas
│   ├── database/          
│   │   └── db.py          # SQLite connection manager, schema, and demo seeding
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── components/    # Reusable UI components (ProductCard, Modals, NeoButton)
    │   ├── contexts/      # React Context providers (AuthContext w/ JWT expiry logic)
    │   ├── hooks/         # Custom state logic (useProducts, useCountdown)
    │   ├── lib/           # Utility functions (api.ts for fetch wrappers)
    │   └── pages/         # Route views (Dashboard.tsx, Login.tsx)
    ├── .env               # Frontend environment configuration
    └── tailwind.config.ts # Neo-Brutalist design tokens
```

---

*Designed and engineered as a demonstration of production-ready Full-Stack AI integration.*
