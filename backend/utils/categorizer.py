"""
ML-based expense categorizer using a trained TF-IDF + Naive Bayes pipeline.
Falls back to rule-based scoring if the model file is not found or confidence is low.
"""

import os
import re

# ── Rule-based fallback ────────────────────────────────────────────────────────
CATEGORY_RULES = {
    'Food & Dining': [
        'restaurant', 'food', 'lunch', 'dinner', 'breakfast', 'cafe', 'coffee',
        'pizza', 'burger', 'grocery', 'groceries', 'supermarket', 'meal', 'eat',
        'snack', 'drink', 'bar', 'pub', 'takeaway', 'takeout', 'zomato', 'swiggy',
        'uber eats', 'doordash', 'starbucks', 'mcdonald', 'kfc', 'subway', 'biryani',
        'dine', 'canteen', 'bakery', 'juice', 'tea', 'chai'
    ],
    'Transport': [
        'uber', 'ola', 'lyft', 'taxi', 'cab', 'auto', 'rickshaw', 'metro',
        'bus', 'train', 'flight', 'airline', 'petrol', 'gas', 'fuel', 'parking',
        'toll', 'rapido', 'indigo', 'spicejet', 'irctc', 'ticket', 'transport',
        'commute', 'travel', 'vehicle', 'bike', 'car service', 'rental'
    ],
    'Shopping': [
        'amazon', 'flipkart', 'myntra', 'clothes', 'shirt', 'shoes', 'dress',
        'shopping', 'mall', 'store', 'purchase', 'buy', 'order', 'delivery',
        'electronics', 'phone', 'laptop', 'gadget', 'furniture', 'home decor',
        'fashion', 'accessories', 'jewellery', 'watch', 'bag', 'meesho', 'ajio'
    ],
    'Healthcare': [
        'doctor', 'hospital', 'clinic', 'medicine', 'pharmacy', 'medical',
        'health', 'dental', 'eye', 'lab', 'test', 'prescription', 'surgery',
        'consultation', 'physio', 'therapy', 'wellness', 'chemist', 'apollo',
        'netmeds', '1mg', 'insurance', 'covid', 'vaccine', 'checkup'
    ],
    'Entertainment': [
        'movie', 'netflix', 'amazon prime', 'hotstar', 'spotify', 'youtube',
        'game', 'gaming', 'concert', 'event', 'ticket', 'theatre', 'cinema',
        'pvr', 'inox', 'fun', 'park', 'play', 'hobby', 'music', 'subscription',
        'streaming', 'bookmyshow', 'disney', 'show', 'sports', 'gym membership'
    ],
    'Education': [
        'course', 'book', 'education', 'school', 'college', 'university', 'fee',
        'tuition', 'class', 'study', 'exam', 'certification', 'training', 'udemy',
        'coursera', 'skillshare', 'workshop', 'seminar', 'stationery', 'notebook',
        'pen', 'coaching', 'learn', 'tutorial', 'library'
    ],
    'Bills & Utilities': [
        'electricity', 'water', 'gas', 'internet', 'wifi', 'phone bill', 'mobile',
        'recharge', 'broadband', 'cable', 'dth', 'tata', 'airtel', 'jio', 'vodafone',
        'bsnl', 'postpaid', 'prepaid', 'bill', 'utility', 'maintenance', 'society',
        'rent', 'emi', 'loan', 'insurance premium'
    ],
    'Personal Care': [
        'salon', 'haircut', 'spa', 'beauty', 'cosmetics', 'makeup', 'skincare',
        'shampoo', 'soap', 'hygiene', 'grooming', 'nails', 'facial', 'massage',
        'parlour', 'barber', 'loreal', 'nykaa', 'purplle'
    ],
    'Travel': [
        'hotel', 'resort', 'airbnb', 'oyo', 'makemytrip', 'goibibo', 'holiday',
        'vacation', 'tour', 'sightseeing', 'trip', 'excursion', 'passport', 'visa'
    ],
    'Investments': [
        'stock', 'mutual fund', 'sip', 'fd', 'fixed deposit', 'zerodha', 'groww',
        'upstox', 'invest', 'gold', 'crypto', 'bitcoin', 'portfolio', 'dividend',
        'savings', 'ppf', 'nps', 'rd', 'recurring deposit'
    ],
    'Gifts & Donations': [
        'gift', 'donation', 'charity', 'present', 'birthday', 'anniversary',
        'wedding', 'festival', 'diwali', 'christmas', 'eid', 'donate', 'ngo'
    ],
}

def _rule_based(text: str) -> str:
    text = re.sub(r'[^a-z0-9\s]', ' ', text.lower())
    scores = {cat: 0 for cat in CATEGORY_RULES}
    for category, keywords in CATEGORY_RULES.items():
        for keyword in keywords:
            if keyword in text:
                scores[category] += (2 if len(keyword) > 5 else 1)
    best = max(scores, key=scores.get)
    return best if scores[best] > 0 else 'Other'


# ── ML model loader ────────────────────────────────────────────────────────────
_pipeline = None
_MODEL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'model.pkl')
_CONFIDENCE_THRESHOLD = 0.40

def _load_model():
    global _pipeline
    if _pipeline is not None:
        return _pipeline
    if not os.path.exists(_MODEL_PATH):
        return None
    try:
        import joblib
        _pipeline = joblib.load(_MODEL_PATH)
        print(f"[categorizer] ML model loaded from {_MODEL_PATH}")
        return _pipeline
    except Exception as e:
        print(f"[categorizer] Failed to load ML model: {e}")
        return None


# ── Public API ─────────────────────────────────────────────────────────────────
def categorize_expense(title: str, notes: str = '') -> str:
    text = (title + ' ' + (notes or '')).strip()
    model = _load_model()

    if model is not None:
        try:
            proba = model.predict_proba([text])[0]
            max_confidence = proba.max()
            if max_confidence >= _CONFIDENCE_THRESHOLD:
                predicted = model.classes_[proba.argmax()]
                return predicted
            # Low confidence — fall through to rule-based
        except Exception as e:
            print(f"[categorizer] ML prediction error: {e}")

    return _rule_based(text)
