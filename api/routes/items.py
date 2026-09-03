import os
from flask import Blueprint, request, jsonify
from datetime import datetime, timezone
from helpers.db import supabase
from helpers.auth import is_user_authenticated
from helpers.messages import UNAUTHENTICATED, ITEM_REQUIRED, NO_FIELD, ID_REQUIRED, POSITION_REQUIRED, DATA_REQUIRED

#------------------------------
# ROUTES
#------------------------------

items_bp = Blueprint("items", __name__, url_prefix="/v1/item")


@items_bp.route("", methods=["GET"])
def get_item():
    if not is_user_authenticated():
        return jsonify(UNAUTHENTICATED), 401
    rows = supabase.schema("mealplan").table("item").select("*").eq("is_archived", False).order("position").execute()
    return jsonify(rows.data if hasattr(rows, "data") else rows)

@items_bp.route("", methods=["POST"])
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
        .select("*")
        .execute()
    )

    return jsonify(result.data)

@items_bp.route("", methods=["PATCH"])
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

    if "category_position" in data:
        update_fields["category_position"] = data["category_position"]

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

@items_bp.route("/archive_all", methods=["PATCH"])
def archive_all_items():
    if not is_user_authenticated():
        return jsonify(UNAUTHENTICATED), 401

    update_fields = {
        "is_archived": True,
        "archived_at": datetime.now(timezone.utc).isoformat(),
        "position": None,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }

    result = (
        supabase.schema("mealplan")
        .table("item")
        .update(update_fields)
        .eq("is_archived", False)
        .select("*")
        .execute()
    )

    return jsonify(result.data)