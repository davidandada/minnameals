import os
from flask import Flask, request, jsonify
from supabase import create_client
from datetime import datetime, timezone
from helpers.auth import is_cookie_valid, is_user_authenticated
from helpers.messages import UNAUTHENTICATED, ITEM_REQUIRED, NO_FIELD, ID_REQUIRED

#------------------------------
# SUPERBASE PUBLIC DEMO KEY
#------------------------------

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

app = Flask(__name__)

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
    if not is_user_authenticated():
        return jsonify(UNAUTHENTICATED), 401
    rows = supabase.schema("mealplan").table("list_items").select("*").eq("is_archived", False).order("id").execute()
    return jsonify(rows.data if hasattr(rows, "data") else rows)

@app.route("/v1/list_items", methods=["POST"])
def create_list_items():
    if not is_user_authenticated():
        return jsonify(UNAUTHENTICATED), 401
    data = request.get_json() 
    # { "item": "apples" }

    if not "item" in data:
        return jsonify(ITEM_REQUIRED), 400

    result = (
        supabase.schema("mealplan").table("list_items")
        .insert({
            "item": data["item"],
            "position": data["position"]
        })
        .select("*")
        .execute()
    )

    return jsonify(result.data)

@app.route("/v1/list_items", methods=["PATCH"])
def update_list_items():
    if not is_user_authenticated():
        return jsonify(UNAUTHENTICATED), 401
    data = request.get_json()
    # { "id": 1, "item": "apples", "is_checked": true, "is_archived": true }

    if not "id" in data:
        return jsonify(ID_REQUIRED), 400

    update_fields = {}

    if "item" in data:
        update_fields["item"] = data["item"]

    if "position" in data:
        update_fields["position"] = data["position"]

    if "is_checked" in data:
        update_fields["is_checked"] = data["is_checked"]

    if "is_archived" in data:
        update_fields["is_archived"] = data["is_archived"]

        if data["is_archived"] is True:
            update_fields["archived_at"] = datetime.now(timezone.utc).isoformat()

    if not update_fields:
        return jsonify(NO_FIELD), 400
    
    update_fields["updated_at"] = datetime.now(timezone.utc).isoformat()

    result = (
        supabase.schema("mealplan")
        .table("list_items")
        .update(update_fields)
        .eq("id", data["id"])
        .select("*")
        .execute()
    )

    return jsonify(result.data)