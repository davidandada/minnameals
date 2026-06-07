import os
from flask import Flask, request, jsonify
from supabase import create_client
from datetime import datetime, timezone

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
        return jsonify({ "message": "You are not authenticated "}), 401
    rows = supabase.schema("mealplan").table("list_items").select("*").eq("is_archived", False).order("id").execute()
    return jsonify(rows.data if hasattr(rows, "data") else rows)

@app.route("/v1/list_items", methods=["POST"])
def create_list_items():
    data = request.get_json() 
    # { item: 'apples' }

    if not "item" in data:
        return jsonify({"error": "Item is required"}), 400

    result = (
        supabase.schema("mealplan").table("list_items")
        .insert({
            "item": data["item"]
        })
        .select("*")
        .eq("is_archived", False)
        .execute()
    )

    return jsonify(result.data)

@app.route("/v1/list_items", methods=["PATCH"])
def create_list_items():
    data = request.get_json()
    # { id: 1, item: 'apples', is_checked: true, is_archived: true }

    if not "id" in data:
        return jsonify({"error": "ID is required"}), 400

    update_fields = {}

    if "item" in data:
        update_fields["item"] = data["item"]

    if "is_checked" in data:
        update_fields["is_checked"] = data["is_checked"]

    if "is_archived" in data:
        update_fields["is_archived"] = data["is_archived"]

        if data["is_archived"] is True:
            update_fields["archived_at"] = datetime.now(timezone.utc)

    update_fields["updated_at"] = datetime.now(timezone.utc)

    if not update_fields:
        return jsonify({"error": "No fields to update"}), 400

    result = (
        supabase.schema("mealplan")
        .table("list_items")
        .update(update_fields)
        .eq("id", data["id"])
        .select("*")
        .execute()
    )

    return jsonify(result.data)