# DynaPrice Frontend

React + TypeScript frontend for the DynaPrice dynamic pricing demo.  
Styled with **Neobrutalism** using Tailwind CSS.

## Prerequisites

- Node.js 18+

## Setup & Run

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev
```

The app will open at **http://localhost:5173**.

> **Note:** The FastAPI backend must be running at `http://localhost:8000` for price predictions to work. If it's offline, the UI will show a banner and pause price updates gracefully.

## Key Features

- **6 seeded products** with categories loaded from `localStorage` on first visit.
- **60-second price update cycle** — sends a batch prediction request and updates all product prices automatically. The countdown survives page refreshes.
- **"Simulate shopper activity"** button — randomly bumps view/wishlist/cart/buy counts across all products to make the next tick produce visible price changes.
- **Neobrutalism UI** — thick black borders, hard offset shadows, flat saturated colors, chunky buttons.
- **Backend-down handling** — a banner appears when `/health` is unreachable; no crash, no silent failure.
