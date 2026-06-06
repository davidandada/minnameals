import os
from flask import Flask, request, jsonify
from supabase import create_client

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

@app.route("/todos", methods=["GET"])
def get_todos():
    rows = supabase.schema("mealplan").table("list_items").select("*").order("id").execute()
    return jsonify(rows.data if hasattr(rows, "data") else rows)
