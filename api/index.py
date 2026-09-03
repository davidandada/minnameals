from flask import Flask
from routes.items import items_bp
from routes.categories import categories_bp
from routes.auth import auth_bp

app = Flask(__name__)
app.register_blueprint(items_bp)
app.register_blueprint(categories_bp)
app.register_blueprint(auth_bp)

if __name__ == '__main__':
    app.run()