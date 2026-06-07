import os
from flask import Flask, request, make_response, jsonify
from supabase import create_client

#------------------------------
# SUPERBASE PUBLIC DEMO KEY
#------------------------------

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

app = Flask(__name__)

def is_cookie_valid():
    auth_password = os.getenv("APP_PASSWORD")
    app_password = request.cookies.get('app_password')

    success = auth_password == app_password

    return success

#------------------------------
# ROUTES
#------------------------------

# Using set_cookie( ) method to set the key-value pairs below.
@app.route('/v1/auth')
def auth():
    
    success = is_cookie_valid()

    return jsonify({
        "success": success
    })

@app.route("/v1/list_items", methods=["GET"])
def get_list_items():
    authenticated = is_cookie_valid()
    if not authenticated:
        return "error", 401
    rows = supabase.schema("mealplan").table("list_items").select("*").eq("is_archived", False).order("id").execute()
    return jsonify(rows.data if hasattr(rows, "data") else rows)
