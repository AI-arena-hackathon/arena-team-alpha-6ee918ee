# SeniorSpeak Grocery

Team alpha — spec §3.2 hackathon build.

**One-liner:** Voice‑first grocery ordering for seniors with limited tech use.

**Problem:** Older adults (65+) often struggle with smartphone apps for grocery delivery, leading to missed supplies and isolation.

**Solution:** A low‑cost, AI‑powered voice assistant that guides seniors through item selection, offers dietary suggestions, and places orders on partnered delivery services via simple voice commands.

**Build scope:** **SeniorSpeak Grocery – Day 4‑5 Build Plan (Section 3.1 – Architecture)**  

**Tech stack** – Front‑end: plain HTML + Tailwind CSS, a single **React** page (create‑react‑app) for UI and Web Speech API (voice input). Back‑end: **Node / Express** (single `server.js`) exposing two REST endpoints, persisting data in a local **SQLite** DB (via `better-sqlite3`). All code lives in one GitHub repo; run with `npm start`.  

**Three minimal components**  

1. **Voice Interface** – Web Speech API (speech‑to‑text) → sends transcript to `/search`. Returns matching catalog items (JSON).  
2. **Catalog & Order Service** – Express route `/search?q=` queries SQLite `products` table (≈30 low‑cost, senior‑friendly items). `/order` accepts a list of SKUs, creates a row in `orders` table and returns a mock confirmation ID.  
3. **Mock Delivery API** – Local fixture (`mockDelivery.js`) that pretends to call an external grocery‑delivery partner; returns a static “order scheduled for tomorrow” payload. Integrated via a single internal call from `/order`.  

**Top 2 risks**  

1. **Speech accuracy on low‑end devices** – seniors may have noisy environments; fallback to a simple text input field if `speechRecognition` fails.  
2. **SQLite concurrency in the sandbox** – simultaneous writes could lock the DB; limit to one request at a time (Express middleware) and keep the MVP single‑user.  

**Fallback (minimum viable slice)** – If voice integration stalls, ship a clickable list UI where users tap items; keep the same order‑POST flow. If SQLite proves problematic, swap to an in‑memory JSON store (`orders.json`) that persists only for the session.  

**Out‑of‑scope for the hackathon**  

- Real‑time integration with third‑party grocery delivery services (only the mock stub).  
- Multi‑language support or advanced dietary recommendation engine.  
- Persistent user accounts / authentication.  
- Deployment to cloud/Kubernetes, analytics dashboards, or HIPAA‑level data handling.  

Running the MVP: `npm install && npm start` – opens `http://localhost:3000` with a single “Speak” button that drives the entire flow.

**Configuration (environment variables):**

- `PORT` — port the Express server listens on (default `3000`).
- `CATALOG_PATH` — optional path to a JSON file with the product catalog, e.g. `[{ "sku": "milk-whole", "name": "Whole Milk 1 Gallon", "category": "dairy", "price": 3.49, "unit": "gallon" }]` (or `{ "products": [...] }`). Defaults to the built-in catalog when unset.

Copy `.env.example` to `.env` to override locally.

Built entirely by an AI coding agent across discrete GitHub Actions build turns (spec §8) — no human-written code.
