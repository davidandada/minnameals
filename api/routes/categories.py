import os
from flask import Blueprint, request, jsonify
from datetime import datetime, timezone
from helpers.db import supabase
from helpers.auth import is_user_authenticated
from helpers.messages import UNAUTHENTICATED, NO_FIELD, ID_REQUIRED, NAME_REQUIRED, DATA_REQUIRED

#------------------------------
# ROUTES
#------------------------------

categories_bp = Blueprint("categories", __name__, url_prefix="/v1/categories")


@categories_bp.route("", methods=["GET"])
def get_category():
    if not is_user_authenticated():
        return jsonify(UNAUTHENTICATED), 401
    rows = supabase.schema("mealplan").table("category").select("*").eq("is_archived", False).order("id").execute()
    return jsonify(rows.data if hasattr(rows, "data") else rows)

@categories_bp.route("", methods=["POST"])
def create_category():
    if not is_user_authenticated():
        return jsonify(UNAUTHENTICATED), 401
    data = request.get_json()
    # { "name": "Produce", "emoji": "🥦", "colour": "baedaGreen" }

    if not data:
        return jsonify(DATA_REQUIRED), 400

    if not data.get("name"):
        return jsonify(NAME_REQUIRED), 400

    result = (
        supabase.schema("mealplan").table("category")
        .insert({
            "name": data["name"],
            "emoji": data.get("emoji") or None,
            "colour": data.get("colour") or None
        })
        .execute()
    )

    return jsonify(result.data)

@categories_bp.route("", methods=["PATCH"])
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

    if "emoji" in data:
        update_fields["emoji"] = data["emoji"] or None
    
    if "colour" in data:
        update_fields["colour"] = data["colour"] or None

    if "position" in data:
        update_fields["position"] = data["position"]

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
