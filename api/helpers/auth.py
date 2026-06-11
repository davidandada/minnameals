import os
from flask import request, jsonify

def is_cookie_valid():
    auth_password = os.getenv("APP_PASSWORD")
    app_password = request.cookies.get('app_password')

    success = auth_password == app_password

    return success


def is_user_authenticated():
    authenticated = is_cookie_valid()
    if not authenticated:
        return jsonify({ "message": "You are not authenticated "}), 401