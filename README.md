# SpendSense — AI Powered Expense Tracker

A full-stack premium expense intelligence console with automatic machine learning categorization. Structured into a high-speed **FastAPI** backend and a modular **Vite + React** single-page application styled in a gorgeous, Apple-inspired **neon green & emerald** theme.

---

## Project Structure

```
SpendSense/
├── backend/
│   ├── app.py                  # FastAPI application entry point (Port 8000)
│   ├── .env                    # Environment credentials file (Hides DB and secret keys)
│   ├── requirements.txt        # Python FastAPI dependencies
│   ├── expenses.db             # SQLite database (Auto-created local fallback)
│   ├── models/
│   │   └── models.py           # Native SQLAlchemy User & Expense schemas (Resilient failover)
│   ├── routes/
│   │   ├── auth_fastapi.py     # JWT Auth, user session, forgot & reset password routers (Val. bounds)
│   │   └── expenses_fastapi.py # CRUD, public sandbox categorization, & insights telemetry
│   └── utils/
│       ├── categorizer.py      # TF-IDF + Naive Bayes ML categorizer pipeline
│       └── model.pkl           # Trained classification model binaries
│
└── frontend/
    ├── index.html              # Clean Vite template loading entrypoint
    ├── public/
    │   └── favicon.svg         # Consistent brand logo SVG (Neon green themed)
    ├── package.json            # React, Chart.js, and Lucide icon dev packages
    ├── vite.config.js          # Vite compiling configurations
    └── src/
        ├── main.jsx            # React root mount entrypoint
        ├── App.jsx             # HTML5 Path router, protected route guards, Razorpay unlock overlay
        ├── App.css             # Cleared boilerplate stylesheet
        ├── index.css           # Neon green theme variables, Apple glassmorphic rules, and animations
        └── components/
            ├── LandingPage.jsx # Hero page featuring animated particle background and public ML Sandbox
            ├── TopBar.jsx      # Glassmorphic top navigation header with obvious Sign Out button
            ├── AuthPage.jsx    # Login, signup, forgot password, and reset credential forms
            ├── Dashboard.jsx   # Spend summary gauge, monthly trends, and transaction stack
            ├── ExpensesPage.jsx# Searchable database lists, filter dropdowns, and modal logging
            ├── InsightsPage.jsx# Analytical radar segments, comparative horizontal bars, and totals
            └── NotFoundPage.jsx# Fallback coordinate route (404 page with 5s home redirect countdown)
```

---

## Prerequisites

- **Python 3.12+**
- **Node.js 18+** & **npm**
- A modern web browser supporting CSS grid, filters, and standard WebGL.

---

## Setup & Run

### 1. Environment Configuration

Create a file named `.env` in the `backend/` directory:

```env
# Database connection string (default uses serverless Neon Postgres)
DATABASE_URL=postgresql://neondb_owner:npg_K9nUF4omRiIQ@ep-nameless-rain-aytkowvl-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# Hashing secret key for JWT token signatures
JWT_SECRET_KEY=your-custom-secure-token-hash-key
```

---

### 2. Backend Server Setup (Port 8000)

```bash
cd backend

# Create a virtual environment
python -m venv venv

# Activate the environment
# On macOS/Linux:
source venv/bin/activate
# On Windows (PowerShell):
venv\Scripts\Activate.ps1

# Install requirements
pip install -r requirements.txt

# Start the FastAPI application
python app.py
```

Uvicorn will spin up at **`http://localhost:8000`**. You can inspect the Swagger interactive testing panel at **`http://localhost:8000/docs`**.

> **Note on Resilient Database Failover**: The app connects by default to the remote Postgres DB provided in your `.env` file. If the network is offline or database connection fails, it automatically falls back to a local SQLite database (`expenses.db`), preventing startup crashes.

---

### 3. Frontend Development Server Setup (Port 5173)

Open a new terminal window:

```bash
cd frontend

# Install Node modules
npm install

# Run the Vite compiler in watch mode
npm run dev
```

The compiled application console will launch at **`http://127.0.0.1:5173/`**.

---

## Security Implementation Checklists

- 🔒 **Credentials Separation**: Hides sensitive PostgreSQL host links and hashing secrets inside a git-ignored [`.env`](file:///c:/Users/sharm/Downloads/Projects/SpendSense/backend/.env) file.
- 🌐 **Restricted CORS Policy**: Explicitly locks origin validation to the production deployment domain `https://spendsense-xyz.netlify.app` and local dev testing ports.
- 🛡️ **SQL Injection Protection**: All backend transactions use SQLAlchemy ORM parameterized statements, preventing raw SQL string interpolations.
- 📏 **Input Length Validation**: Enforces strict Pydantic `Field(max_length=X)` size constraints on payload titles, emails, passwords, and tokens to block overflow and buffer-bloat denial-of-service vectors.
- 🚀 **Security HTTP Headers**: Integrates an intercepting middleware in FastAPI injecting XSS and frame hijacking defense headers:
  * `X-Frame-Options: DENY` (anti-clickjacking)
  * `X-XSS-Protection: 1; mode=block` (script blocking)
  * `X-Content-Type-Options: nosniff` (anti-mime hijacking)
  * `Referrer-Policy: strict-origin-when-cross-origin`

---

## Core Visual Features

- 🟢 **Vibrant Neon Green theme**: High-end cyberpunk-inspired visual systems featuring charcoal background canvas orbits, glowing accent widgets, and glassmorphic card grids.
- 🗺️ **HTML5 History API Routing**: A pure, hash-free single page router managing standard direct browser endpoints (`/`, `/login`, `/dashboard`, `/expenses`, `/insights`).
- ⏱️ **Redirection 404 Interceptor**: Renders an alert shield alongside a real-time countdown timer that automatically redirects back to the homepage after 5 seconds.
- 💸 **SVG Budget Dial Gauge**: A custom circular expenditure outline that shrinks and shifts color based on spending reach limits.
- 💳 **Razorpay Success Unlock**: Green circular drawing ticks, loading indicators, and text slide-ins unlocking dashboards upon successful authentication.
