from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, date
from collections import defaultdict
from models.models import db, Expense
from utils.categorizer import categorize_expense

expenses_bp = Blueprint('expenses', __name__)


def parse_date(date_str):
    try:
        return datetime.strptime(date_str, '%Y-%m-%d').date()
    except Exception:
        return date.today()


@expenses_bp.route('/', methods=['GET'])
@jwt_required()
def get_expenses():
    uid = int(get_jwt_identity())
    month = request.args.get('month')  # format: YYYY-MM
    category = request.args.get('category')

    query = Expense.query.filter_by(user_id=uid)
    if month:
        try:
            y, m = map(int, month.split('-'))
            query = query.filter(
                db.extract('year', Expense.date) == y,
                db.extract('month', Expense.date) == m
            )
        except Exception:
            pass
    if category:
        query = query.filter_by(category=category)

    expenses = query.order_by(Expense.date.desc()).all()
    return jsonify([e.to_dict() for e in expenses]), 200


@expenses_bp.route('/', methods=['POST'])
@jwt_required()
def add_expense():
    uid = int(get_jwt_identity())
    data = request.get_json()

    title = data.get('title', '').strip()
    amount = data.get('amount')
    notes = data.get('notes', '')
    date_str = data.get('date', '')
    category = data.get('category', '').strip()

    if not title or amount is None:
        return jsonify({'error': 'Title and amount are required'}), 400
    try:
        amount = float(amount)
        if amount <= 0:
            raise ValueError
    except ValueError:
        return jsonify({'error': 'Amount must be a positive number'}), 400

    if not category:
        category = categorize_expense(title, notes)

    expense = Expense(
        user_id=uid,
        title=title,
        amount=amount,
        category=category,
        date=parse_date(date_str),
        notes=notes
    )
    db.session.add(expense)
    db.session.commit()
    return jsonify(expense.to_dict()), 201


@expenses_bp.route('/<int:expense_id>', methods=['PUT'])
@jwt_required()
def update_expense(expense_id):
    uid = int(get_jwt_identity())
    expense = Expense.query.filter_by(id=expense_id, user_id=uid).first()
    if not expense:
        return jsonify({'error': 'Expense not found'}), 404

    data = request.get_json()
    if 'title' in data:
        expense.title = data['title'].strip()
    if 'amount' in data:
        try:
            expense.amount = float(data['amount'])
        except ValueError:
            return jsonify({'error': 'Invalid amount'}), 400
    if 'notes' in data:
        expense.notes = data['notes']
    if 'date' in data:
        expense.date = parse_date(data['date'])
    if 'category' in data and data['category']:
        expense.category = data['category']
    elif 'title' in data:
        expense.category = categorize_expense(expense.title, expense.notes)

    db.session.commit()
    return jsonify(expense.to_dict()), 200


@expenses_bp.route('/<int:expense_id>', methods=['DELETE'])
@jwt_required()
def delete_expense(expense_id):
    uid = int(get_jwt_identity())
    expense = Expense.query.filter_by(id=expense_id, user_id=uid).first()
    if not expense:
        return jsonify({'error': 'Expense not found'}), 404
    db.session.delete(expense)
    db.session.commit()
    return jsonify({'message': 'Deleted'}), 200


@expenses_bp.route('/categorize', methods=['POST'])
@jwt_required()
def categorize():
    data = request.get_json()
    title = data.get('title', '')
    notes = data.get('notes', '')
    category = categorize_expense(title, notes)
    return jsonify({'category': category}), 200


@expenses_bp.route('/insights', methods=['GET'])
@jwt_required()
def insights():
    uid = int(get_jwt_identity())
    month = request.args.get('month')

    query = Expense.query.filter_by(user_id=uid)
    if month:
        try:
            y, m = map(int, month.split('-'))
            query = query.filter(
                db.extract('year', Expense.date) == y,
                db.extract('month', Expense.date) == m
            )
        except Exception:
            pass

    expenses = query.all()
    total = sum(e.amount for e in expenses)
    by_category = defaultdict(float)
    monthly = defaultdict(float)

    for e in expenses:
        by_category[e.category] += e.amount
        key = e.date.strftime('%Y-%m')
        monthly[key] += e.amount

    category_data = [{'category': k, 'amount': round(v, 2), 'percent': round(v / total * 100, 1) if total else 0}
                     for k, v in sorted(by_category.items(), key=lambda x: -x[1])]

    monthly_data = [{'month': k, 'amount': round(v, 2)} for k, v in sorted(monthly.items())]

    return jsonify({
        'total': round(total, 2),
        'count': len(expenses),
        'by_category': category_data,
        'monthly': monthly_data
    }), 200
