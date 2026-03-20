"""
Run this script ONCE to train and save the ML model.
Usage: python utils/train_model.py
It will create model.pkl and vectorizer.pkl inside backend/utils/
"""

import joblib
import os
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

# ── Training Data ──────────────────────────────────────────────────────────────
TRAINING_DATA = [
    # Food & Dining
    ("zomato order", "Food & Dining"),
    ("swiggy delivery", "Food & Dining"),
    ("lunch at cafe", "Food & Dining"),
    ("dinner restaurant", "Food & Dining"),
    ("breakfast hotel", "Food & Dining"),
    ("pizza hut order", "Food & Dining"),
    ("burger king meal", "Food & Dining"),
    ("kfc chicken", "Food & Dining"),
    ("mcdonald combo", "Food & Dining"),
    ("starbucks coffee", "Food & Dining"),
    ("grocery shopping", "Food & Dining"),
    ("supermarket vegetables", "Food & Dining"),
    ("milk bread eggs", "Food & Dining"),
    ("biryani dinner", "Food & Dining"),
    ("chai tapri", "Food & Dining"),
    ("juice bar", "Food & Dining"),
    ("bakery snacks", "Food & Dining"),
    ("canteen lunch", "Food & Dining"),
    ("team lunch office", "Food & Dining"),
    ("food delivery", "Food & Dining"),
    ("takeaway dinner", "Food & Dining"),
    ("dominos pizza", "Food & Dining"),
    ("subway sandwich", "Food & Dining"),
    ("weekly groceries", "Food & Dining"),
    ("restaurant bill", "Food & Dining"),

    # Transport
    ("uber ride", "Transport"),
    ("ola cab", "Transport"),
    ("rapido bike", "Transport"),
    ("metro card recharge", "Transport"),
    ("bus ticket", "Transport"),
    ("auto rickshaw", "Transport"),
    ("petrol refill", "Transport"),
    ("fuel car", "Transport"),
    ("parking fee", "Transport"),
    ("toll charge", "Transport"),
    ("train ticket irctc", "Transport"),
    ("flight ticket indigo", "Transport"),
    ("spicejet booking", "Transport"),
    ("cab airport", "Transport"),
    ("bike fuel", "Transport"),
    ("monthly bus pass", "Transport"),
    ("car service garage", "Transport"),
    ("vehicle maintenance", "Transport"),
    ("rapido auto", "Transport"),
    ("taxi fare", "Transport"),

    # Shopping
    ("amazon order", "Shopping"),
    ("flipkart purchase", "Shopping"),
    ("myntra clothes", "Shopping"),
    ("new shirt bought", "Shopping"),
    ("shoes purchase", "Shopping"),
    ("dress shopping", "Shopping"),
    ("meesho order", "Shopping"),
    ("ajio fashion", "Shopping"),
    ("electronics gadget", "Shopping"),
    ("new phone bought", "Shopping"),
    ("laptop accessories", "Shopping"),
    ("home decor items", "Shopping"),
    ("furniture delivery", "Shopping"),
    ("watch purchase", "Shopping"),
    ("bag handbag", "Shopping"),
    ("jewellery bought", "Shopping"),
    ("online shopping", "Shopping"),
    ("mall shopping", "Shopping"),
    ("new headphones", "Shopping"),
    ("kitchen appliance", "Shopping"),

    # Healthcare
    ("doctor consultation", "Healthcare"),
    ("hospital bill", "Healthcare"),
    ("pharmacy medicine", "Healthcare"),
    ("medical test lab", "Healthcare"),
    ("dental checkup", "Healthcare"),
    ("eye checkup optician", "Healthcare"),
    ("prescription medicines", "Healthcare"),
    ("health insurance premium", "Healthcare"),
    ("apollo pharmacy", "Healthcare"),
    ("netmeds order", "Healthcare"),
    ("1mg medicines", "Healthcare"),
    ("physiotherapy session", "Healthcare"),
    ("blood test report", "Healthcare"),
    ("vaccination covid", "Healthcare"),
    ("clinic fees", "Healthcare"),
    ("surgery bill", "Healthcare"),
    ("wellness checkup", "Healthcare"),
    ("chemist medicines", "Healthcare"),
    ("x ray scan", "Healthcare"),
    ("therapy counselling", "Healthcare"),

    # Entertainment
    ("netflix subscription", "Entertainment"),
    ("amazon prime renewal", "Entertainment"),
    ("hotstar subscription", "Entertainment"),
    ("spotify premium", "Entertainment"),
    ("movie ticket pvr", "Entertainment"),
    ("inox cinema", "Entertainment"),
    ("bookmyshow ticket", "Entertainment"),
    ("concert ticket", "Entertainment"),
    ("gaming purchase", "Entertainment"),
    ("steam game", "Entertainment"),
    ("youtube premium", "Entertainment"),
    ("disney plus", "Entertainment"),
    ("amusement park", "Entertainment"),
    ("zoo entry ticket", "Entertainment"),
    ("sports event ticket", "Entertainment"),
    ("gym membership fee", "Entertainment"),
    ("club entry", "Entertainment"),
    ("escape room", "Entertainment"),
    ("bowling game", "Entertainment"),
    ("playstation game", "Entertainment"),

    # Education
    ("udemy course", "Education"),
    ("coursera subscription", "Education"),
    ("college tuition fee", "Education"),
    ("school fee", "Education"),
    ("coaching class", "Education"),
    ("books stationery", "Education"),
    ("notebook pen bought", "Education"),
    ("exam registration fee", "Education"),
    ("certification course", "Education"),
    ("skillshare membership", "Education"),
    ("workshop seminar", "Education"),
    ("training program", "Education"),
    ("library membership", "Education"),
    ("online tutorial", "Education"),
    ("study material", "Education"),
    ("university admission", "Education"),
    ("language class", "Education"),
    ("music lesson", "Education"),
    ("coding bootcamp", "Education"),
    ("textbook purchase", "Education"),

    # Bills & Utilities
    ("electricity bill payment", "Bills & Utilities"),
    ("water bill", "Bills & Utilities"),
    ("internet broadband bill", "Bills & Utilities"),
    ("jio recharge", "Bills & Utilities"),
    ("airtel postpaid bill", "Bills & Utilities"),
    ("vodafone recharge", "Bills & Utilities"),
    ("mobile recharge prepaid", "Bills & Utilities"),
    ("dth tata sky recharge", "Bills & Utilities"),
    ("gas cylinder", "Bills & Utilities"),
    ("society maintenance", "Bills & Utilities"),
    ("rent payment", "Bills & Utilities"),
    ("home loan emi", "Bills & Utilities"),
    ("credit card bill", "Bills & Utilities"),
    ("insurance premium", "Bills & Utilities"),
    ("bsnl bill", "Bills & Utilities"),
    ("cable tv bill", "Bills & Utilities"),
    ("wifi monthly", "Bills & Utilities"),
    ("piped gas bill", "Bills & Utilities"),
    ("property tax", "Bills & Utilities"),
    ("car loan emi", "Bills & Utilities"),

    # Personal Care
    ("salon haircut", "Personal Care"),
    ("spa treatment", "Personal Care"),
    ("beauty parlour", "Personal Care"),
    ("nykaa cosmetics", "Personal Care"),
    ("makeup products", "Personal Care"),
    ("skincare cream", "Personal Care"),
    ("shampoo conditioner", "Personal Care"),
    ("grooming kit", "Personal Care"),
    ("barber shop", "Personal Care"),
    ("nail salon", "Personal Care"),
    ("facial treatment", "Personal Care"),
    ("waxing threading", "Personal Care"),
    ("perfume deodorant", "Personal Care"),
    ("purplle order", "Personal Care"),
    ("body lotion", "Personal Care"),
    ("manicure pedicure", "Personal Care"),
    ("hair color", "Personal Care"),
    ("massage parlour", "Personal Care"),
    ("razor blades", "Personal Care"),
    ("toothbrush toothpaste", "Personal Care"),

    # Travel
    ("hotel booking", "Travel"),
    ("oyo rooms", "Travel"),
    ("airbnb stay", "Travel"),
    ("makemytrip booking", "Travel"),
    ("goibibo hotel", "Travel"),
    ("holiday package", "Travel"),
    ("vacation resort", "Travel"),
    ("sightseeing tour", "Travel"),
    ("travel insurance", "Travel"),
    ("passport renewal", "Travel"),
    ("visa fees", "Travel"),
    ("trip expense", "Travel"),
    ("weekend getaway", "Travel"),
    ("honeymoon package", "Travel"),
    ("cruise booking", "Travel"),
    ("backpacking trip", "Travel"),
    ("tourist guide", "Travel"),
    ("foreign exchange", "Travel"),
    ("travel kit", "Travel"),
    ("hostel booking", "Travel"),

    # Investments
    ("mutual fund sip", "Investments"),
    ("zerodha stocks", "Investments"),
    ("groww investment", "Investments"),
    ("upstox trading", "Investments"),
    ("fixed deposit fd", "Investments"),
    ("ppf contribution", "Investments"),
    ("nps pension", "Investments"),
    ("gold purchase", "Investments"),
    ("bitcoin crypto", "Investments"),
    ("recurring deposit rd", "Investments"),
    ("stock market buy", "Investments"),
    ("elss tax saving", "Investments"),
    ("dividend reinvest", "Investments"),
    ("portfolio rebalance", "Investments"),
    ("sovereign gold bond", "Investments"),
    ("lic premium", "Investments"),
    ("equity fund", "Investments"),
    ("savings deposit", "Investments"),
    ("index fund", "Investments"),
    ("real estate investment", "Investments"),

    # Gifts & Donations
    ("birthday gift", "Gifts & Donations"),
    ("wedding present", "Gifts & Donations"),
    ("diwali gifts", "Gifts & Donations"),
    ("christmas present", "Gifts & Donations"),
    ("charity donation", "Gifts & Donations"),
    ("ngo contribution", "Gifts & Donations"),
    ("anniversary gift", "Gifts & Donations"),
    ("eid gift", "Gifts & Donations"),
    ("temple donation", "Gifts & Donations"),
    ("gift card bought", "Gifts & Donations"),
    ("festival shopping gifts", "Gifts & Donations"),
    ("farewell gift colleague", "Gifts & Donations"),
    ("housewarming gift", "Gifts & Donations"),
    ("baby shower gift", "Gifts & Donations"),
    ("crowdfunding donation", "Gifts & Donations"),
]

def train_and_save():
    texts = [t for t, _ in TRAINING_DATA]
    labels = [l for _, l in TRAINING_DATA]

    X_train, X_test, y_train, y_test = train_test_split(
        texts, labels, test_size=0.2, random_state=42, stratify=labels
    )

    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(
            ngram_range=(1, 2),
            min_df=1,
            max_features=5000,
            sublinear_tf=True
        )),
        ('clf', MultinomialNB(alpha=0.3))
    ])

    pipeline.fit(X_train, y_train)

    y_pred = pipeline.predict(X_test)
    print("\n── Model Evaluation ──────────────────────")
    print(classification_report(y_test, y_pred))

    save_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(save_dir, 'model.pkl')
    joblib.dump(pipeline, model_path)
    print(f"✓ Model saved to {model_path}")

if __name__ == '__main__':
    train_and_save()
