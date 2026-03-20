import os
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from models.models import db
from routes.auth import auth_bp
from routes.expenses import expenses_bp

def create_app():
    app = Flask(__name__)
    CORS(app, origins='*', supports_credentials=True)

    uri = os.getenv("DATABASE_URL", f"sqlite:///{os.path.join(os.path.dirname(os.path.abspath(__file__)), 'expenses.db')}")

    if uri.startswith("postgres://"):
        uri = uri.replace("postgres://", "postgresql://", 1)

    app.config['SQLALCHEMY_DATABASE_URI'] = uri
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'super-secret-key-change-in-prod')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = False

    db.init_app(app)
    JWTManager(app)

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(expenses_bp, url_prefix='/api/expenses')

    with app.app_context():
        db.create_all()

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(host="0.0.0.0", port=10000)