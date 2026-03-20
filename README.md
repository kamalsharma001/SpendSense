# SpendSense — AI Powered Expense Tracker

A full-stack expense tracking application with AI-powered automatic categorization, built with Flask + SQLite backend and a React frontend.

---

## Project Structure

```
ai-expense-tracker/
├── backend/
│   ├── app.py                  # Flask application entry point
│   ├── requirements.txt        # Python dependencies
│   ├── expenses.db             # SQLite database (auto-created on first run)
│   ├── models/
│   │   ├── __init__.py
│   │   └── models.py           # SQLAlchemy User & Expense models
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── auth.py             # Signup, login endpoints
│   │   └── expenses.py         # CRUD + insights endpoints
│   └── utils/
│       ├── __init__.py
│       └── categorizer.py      # Rule-based AI categorizer
│
└── frontend/
    └── index.html              # Single-file React app (CDN-based)
```

---

## Prerequisites

- Python 3.8+
- A modern web browser (Chrome, Firefox, Edge)
- No Node.js required (frontend uses CDN)

---

## Setup & Run

### 1. Clone / Download the project

```bash
cd ai-expense-tracker
```

### 2. Set up the Python backend

```bash
cd backend

# Create a virtual environment
python3 -m venv venv

# Activate it
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Start the backend server

```bash
# Still inside backend/ with venv activated
python app.py
```

You should see:
```
 * Running on http://127.0.0.1:5000
```

The SQLite database (`expenses.db`) is created automatically on first run.

### 4. Open the frontend

Open a new terminal window and serve the frontend:

```bash
cd ai-expense-tracker/frontend

# Using Python's built-in server (recommended):
python3 -m http.server 3000
```

Then open your browser and go to: **http://localhost:3000**

> Alternatively, you can just double-click `frontend/index.html` to open it directly in your browser — it will work as long as the backend is running on port 5000.

---

## REST API Reference

All endpoints require `Authorization: Bearer <token>` header except `/api/auth/*`.

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register a new user |
| POST | `/api/auth/login` | Login and get JWT token |

**Signup body:**
```json
{ "name": "Jane", "email": "jane@example.com", "password": "secret123" }
```

**Login body:**
```json
{ "email": "jane@example.com", "password": "secret123" }
```

**Response:**
```json
{ "token": "<jwt>", "user": { "id": 1, "name": "Jane", "email": "jane@example.com" } }
```

### Expenses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/expenses/` | List all expenses (filterable by `month`, `category`) |
| POST | `/api/expenses/` | Add a new expense |
| PUT | `/api/expenses/<id>` | Update an expense |
| DELETE | `/api/expenses/<id>` | Delete an expense |
| POST | `/api/expenses/categorize` | AI-categorize a title/notes |
| GET | `/api/expenses/insights` | Spending insights & summaries |

**Add expense body:**
```json
{
  "title": "Lunch at Zomato",
  "amount": 350.00,
  "category": "",        // leave empty for AI auto-categorization
  "date": "2024-01-15",
  "notes": "Team lunch"
}
```

**Insights response:**
```json
{
  "total": 12500.00,
  "count": 45,
  "by_category": [
    { "category": "Food & Dining", "amount": 4200.00, "percent": 33.6 }
  ],
  "monthly": [
    { "month": "2024-01", "amount": 6200.00 }
  ]
}
```

---

## AI Categorization

The categorizer uses a keyword-scoring rule engine. It analyzes the expense title and notes against 12 categories:

- 🍽️ Food & Dining
- 🚗 Transport
- 🛍️ Shopping
- 💊 Healthcare
- 🎬 Entertainment
- 📚 Education
- 💡 Bills & Utilities
- ✨ Personal Care
- ✈️ Travel
- 📈 Investments
- 🎁 Gifts & Donations
- 📦 Other

Longer, more specific keywords score higher. The highest-scoring category wins. If no keywords match, it defaults to "Other".

The frontend also calls the `/api/expenses/categorize` endpoint as you type the expense title, showing a live AI suggestion.

---

## Features

- ✅ User authentication (JWT-based)
- ✅ Add, edit, delete expenses
- ✅ AI-powered auto-categorization as you type
- ✅ Dashboard with spending stats
- ✅ Category-wise donut chart
- ✅ Monthly spending trend bar chart
- ✅ Filter by month and category
- ✅ Spending insights with percentages
- ✅ Fully responsive single-page UI

---

## Environment Variables (optional)

Create a `.env` file inside `backend/`:
```
JWT_SECRET_KEY=your-very-secret-key-here
```

If not set, a default development key is used.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python, Flask 3, Flask-JWT-Extended |
| Database | SQLite (via SQLAlchemy ORM) |
| Auth | JWT (JSON Web Tokens) + bcrypt hashing |
| Frontend | React 18 (CDN), Chart.js |
| AI | Rule-based keyword scoring categorizer |
