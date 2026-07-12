import os
from flask import Flask, request, jsonify
from supabase import create_client
from datetime import datetime, timezone
from helpers.auth import is_cookie_valid, is_user_authenticated
from helpers.messages import UNAUTHENTICATED, ITEM_REQUIRED, NO_FIELD, ID_REQUIRED, POSITION_REQUIRED, NAME_REQUIRED, DATA_REQUIRED
from fractional_indexing import generate_key_between

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

@app.route("/v1/item", methods=["GET"])
def get_item():
    if not is_user_authenticated():
        return jsonify(UNAUTHENTICATED), 401
    rows = supabase.schema("mealplan").table("item").select("*, category(id, name)").eq("is_archived", False).order("position").execute()
    return jsonify(rows.data if hasattr(rows, "data") else rows)

@app.route("/v1/category", methods=["GET"])
def get_category():
    if not is_user_authenticated():
        return jsonify(UNAUTHENTICATED), 401
    rows = supabase.schema("mealplan").table("category").select("*").eq("is_archived", False).order("id").execute()
    return jsonify(rows.data if hasattr(rows, "data") else rows)

@app.route("/v1/item", methods=["POST"])
def create_item():
    if not is_user_authenticated():
        return jsonify(UNAUTHENTICATED), 401
    data = request.get_json() 
    # { "item": "apples" }

    if not data:
        return jsonify(DATA_REQUIRED), 400

    if not "item" in data:
        return jsonify(ITEM_REQUIRED), 400
    
    if not "position" in data:
        return jsonify(POSITION_REQUIRED), 400
 
    insert_data = {
        "item": data["item"],
        "position": data["position"]
    }
    if "category_id" in data and data["category_id"] is not None:
        insert_data["category_id"] = data["category_id"]

    result = (
        supabase.schema("mealplan").table("item")
        .insert(insert_data)
        .select("*, category(id, name)")
        .execute()
    )

    return jsonify(result.data)

@app.route("/v1/category", methods=["POST"])
def create_category():
    if not is_user_authenticated():
        return jsonify(UNAUTHENTICATED), 401
    data = request.get_json()
    # { "name": "Produce" }

    if not data:
        return jsonify(DATA_REQUIRED), 400

    if not data.get("name"):
        return jsonify(NAME_REQUIRED), 400

    result = (
        supabase.schema("mealplan").table("category")
        .insert({
            "name": data["name"]
        })
        .execute()
    )

    return jsonify(result.data)

@app.route("/v1/item", methods=["PATCH"])
def update_item():
    if not is_user_authenticated():
        return jsonify(UNAUTHENTICATED), 401
    data = request.get_json()
    # { "id": 1, "item": "apples", "is_checked": true, "is_archived": true }

    if not data:
        return jsonify(DATA_REQUIRED), 400

    if not "id" in data:
        return jsonify(ID_REQUIRED), 400

    update_fields = {}

    if "item" in data:
        update_fields["item"] = data["item"]

    if "is_checked" in data:
        update_fields["is_checked"] = data["is_checked"]

    if "position" in data:
        update_fields["position"] = data["position"]

    if "is_archived" in data:
        update_fields["is_archived"] = data["is_archived"]

        if data["is_archived"] is True:
            update_fields["archived_at"] = datetime.now(timezone.utc).isoformat()
            update_fields["position"] = None

    if "category_id" in data:
        update_fields["category_id"] = data["category_id"]

    if not update_fields:
        return jsonify(NO_FIELD), 400
    
    update_fields["updated_at"] = datetime.now(timezone.utc).isoformat()

    result = (
        supabase.schema("mealplan")
        .table("item")
        .update(update_fields)
        .eq("id", data["id"])
        .select("*")
        .execute()
    )

    return jsonify(result.data)

@app.route("/v1/category", methods=["PATCH"])
def update_category():
    if not is_user_authenticated():
        return jsonify(UNAUTHENTICATED), 401
    data = request.get_json()
    # { "id": 1, "name": "Fresh Produce" }

    if not data:
        return jsonify(DATA_REQUIRED), 400

    if "id" not in data:
        return jsonify(ID_REQUIRED), 400

    update_fields = {}

    if "name" in data:
        update_fields["name"] = data["name"]

    if "is_archived" in data:
        update_fields["is_archived"] = data["is_archived"]

        if data["is_archived"] is True:
            update_fields["archived_at"] = datetime.now(timezone.utc).isoformat()

    if not update_fields:
        return jsonify(NO_FIELD), 400
    
    update_fields["updated_at"] = datetime.now(timezone.utc).isoformat()

    result = (
        supabase.schema("mealplan")
        .table("category")
        .update(update_fields)
        .eq("id", data["id"])
        .select("*")
        .execute()
    )

    return jsonify(result.data)