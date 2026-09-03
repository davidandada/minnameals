import os
from flask import Blueprint, request, jsonify
from helpers.auth import is_cookie_valid

#------------------------------
# ROUTES
#------------------------------

auth_bp = Blueprint("auth", __name__, url_prefix="/v1/auth")


@auth_bp.route("")
def auth():
    
    success = is_cookie_valid()

    return jsonify({
        "success": success
    })