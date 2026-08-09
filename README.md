# SpendSense — AI Powered Expense Tracker

A full-stack premium expense intelligence console with automatic machine learning categorization. Refactored from Flask to a high-speed **FastAPI** backend and structured into a modular **Vite + React** frontend with Apple-like aesthetics, transitions, and dark/light themes.

---

## Project Structure

```
SpendSense/
├── .python-version             # Pins python version (3.12) for root deploy engines
├── runtime.txt                 # Specifies python version (python-3.12.8)
├── backend/
│   ├── app.py                  # FastAPI application entry point (Port 8000)
│   ├── requirements.txt        # Python FastAPI dependencies
│   ├── expenses.db             # SQLite database (Auto-created local fallback)
│   ├── .env                    # Private credentials config (Git ignored)
│   ├── .python-version         # Pins python version (3.12) for backend
│   ├── runtime.txt             # Specifies python version (python-3.12.8)
│   ├── models/
│   │   └── models.py           # Native SQLAlchemy User & Expense schemas (Resilient failover)
│   ├── routes/
│   │   ├── auth_fastapi.py     # JWT Auth, user session, forgot & reset password routers
│   │   └── expenses_fastapi.py # CRUD, public sandbox categorization, & insights telemetry
│   └── utils/
│       ├── categorizer.py      # TF-IDF + Naive Bayes ML categorizer pipeline
│       └── model.pkl           # Trained classification model binaries
│
└── frontend/
    ├── index.html              # Clean Vite template loading entrypoint
    ├── public/
    │   └── favicon.svg         # Consistent glowing brand logo SVG (Neon Green)
    ├── package.json            # React, Chart.js, and Lucide icon dev packages
    ├── vite.config.js          # Vite compiling configurations
    └── src/
        ├── main.jsx            # React root mount entrypoint
        ├── App.jsx             # HTML5 path router, protected guards, Razorpay unlock overlay
        ├── App.css             # Cleared boilerplate stylesheet
        ├── index.css           # Premium neon green/emerald theme system and keyframe animations
        └── components/
            ├── LandingPage.jsx # Hero page featuring animated particle background and public ML Sandbox
            ├── TopBar.jsx      # Glassmorphic top navigation header with obvious Sign Out button
            ├── AuthPage.jsx    # Login, signup, forgot password, and reset credential forms
            ├── Dashboard.jsx   # Spend summary gauge, monthly trends, and transaction stack
            ├── ExpensesPage.jsx# Searchable database lists, filter dropdowns, and modal logging
            ├── InsightsPage.jsx# Analytical radar segments, comparative horizontal bars, and totals
            └── NotFoundPage.jsx# Fallback coordinate route (404 page) with 5s countdown
```

---

## Setup & Run (Local Development)

### 1. Backend Server Setup (Port 8000)

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

# Create a .env file with your credentials:
# DATABASE_URL=postgresql://user:password@host/db
# JWT_SECRET_KEY=your-secure-secret-key-here

# Start the FastAPI application
python app.py
```

Uvicorn will spin up at **`http://localhost:8000`**. You can inspect the Swagger interactive testing panel at **`http://localhost:8000/docs`**.

> **Note on Resilient Database Failover**: The app connects by default to the Postgres URL specified in `.env`. If it runs in an offline container or is unable to reach the host, it automatically logs a warning and falls back to a local SQLite (`expenses.db`) instance, guaranteeing zero startup crashes.

---

### 2. Frontend Development Server Setup (Port 5173)

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

## Production Deployment Guidelines

### 1. Frontend (Deploy to Netlify)
1. Build the production assets:
   ```bash
   cd frontend
   npm run build
   ```
2. This creates a `dist/` directory containing fully optimized, static HTML, JS, and CSS files.
3. Configure a Netlify routing rule to support the HTML5 History API. Create a `_redirects` file inside `frontend/public/` containing:
   ```text
   /*    /index.html   200
   ```
4. Deploy the contents of the `dist/` folder directly to Netlify.

### 2. Backend (Deploy to Render / Railway)
1. Define the following Environment Variables in your hosting console:
   * `DATABASE_URL`: Connection string of your production Neon/PostgreSQL database.
   * `JWT_SECRET_KEY`: A long cryptographic string for secure token signatures.
   * `PYTHON_VERSION`: Set to `3.12.8` (Pins the runtime version to prevent Rust/Cargo wheel mismatch compilation errors).
2. Set the startup command to:
   ```bash
   uvicorn app:app --host 0.0.0.0 --port 8000
   ```
3. The codebase contains `.python-version` and `runtime.txt` configuration files to automatically force the build pipelines to run on Python 3.12.

---

## Technical Specifications & Security Integrations

### Security Check Implementations
* 🛡️ **SQL Injection Prevention**: Built entirely on **SQLAlchemy ORM** using prepared statements and automatic parameter binding. No raw SQL queries are evaluated.
* 🔒 **Parameter Validation (Pydantic Field Constraints)**: Constrained input lengths on user registration, login credentials, and expense fields to reject malformed data payloads or DoS buffer attacks.
* 🌐 **Secure CORS Headers Configuration**: Restriced CORS origins in `app.py` exclusively to `https://spendsense-xyz.netlify.app/` and local dev ports.
* 🧱 **Response Security Headers**: A dynamic FastAPI middleware automatically injects headers on every response:
  * `X-Frame-Options: DENY` (Clickjacking protection)
  * `X-XSS-Protection: 1; mode=block` (Cross-Site Scripting protection)
  * `X-Content-Type-Options: nosniff` (MIME Sniffing protection)

### Design & Architecture
* 🟢 **Neon Green / Emerald Theme**: Ambient forest gradients, responsive card glow systems, and modern Google Fonts (**Outfit** and **Space Grotesk**).
* 🌓 **Dynamic Theme Toggling**: Responsive dark mode (default) and light mode toggleable at every stage.
* 🗺️ **HTML5 History API Routing**: Uses direct path routing (`/`, `/login`, `/dashboard`) instead of hash values, with automatic 5-second countdown redirections on 404 pages.

---

## 👨💻 Author

**Kamal Sharma**  
B.E. Computer Science Engineering (AI & ML)  
Chandigarh University  

📧 sharmakamal1210@gmail.com  
🌐 GitHub: [kamalsharma001](https://github.com/kamalsharma001)
---
