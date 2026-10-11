import json
import os
import random
from flask import Flask, jsonify, render_template, request

app = Flask(__name__)

DATA_FILE = os.path.join(os.path.dirname(__file__), "data", "quotes.json")


def load_quotes():
    """Load quotes from the JSON data file."""
    if not os.path.exists(DATA_FILE):
        return []
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


QUOTES = load_quotes()


@app.route("/")
def index():
    """Render the main single-page application."""
    return render_template("index.html")


@app.route("/api/quote/random", methods=["GET"])
def get_random_quote():
    """Return a single random quote, with optional category or author filter."""
    category = request.args.get("category", "").strip().lower()
    author = request.args.get("author", "").strip().lower()

    pool = QUOTES
    if category:
        pool = [q for q in pool if q.get("category", "").lower() == category]
    if author:
        pool = [q for q in pool if author in q.get("author", "").lower()]

    if not pool:
        return jsonify({"error": "No quotes match the specified criteria"}), 404

    selected = random.choice(pool)
    return jsonify(selected)


@app.route("/api/quotes", methods=["GET"])
def get_quotes():
    """Search and filter quotes by text query, author, or category."""
    query = request.args.get("q", "").strip().lower()
    author = request.args.get("author", "").strip().lower()
    category = request.args.get("category", "").strip().lower()

    results = QUOTES

    if category:
        results = [q for q in results if q.get("category", "").lower() == category]

    if author:
        results = [q for q in results if author in q.get("author", "").lower()]

    if query:
        results = [
            q
            for q in results
            if query in q.get("quote", "").lower()
            or query in q.get("author", "").lower()
            or query in q.get("category", "").lower()
        ]

    return jsonify({"count": len(results), "quotes": results})


@app.route("/api/categories", methods=["GET"])
def get_categories():
    """Return all unique categories with quote counts."""
    category_counts = {}
    for q in QUOTES:
        cat = q.get("category", "General")
        category_counts[cat] = category_counts.get(cat, 0) + 1

    categories = [
        {"name": cat, "count": count}
        for cat, count in sorted(category_counts.items())
    ]
    return jsonify({"categories": categories})


@app.route("/api/authors", methods=["GET"])
def get_authors():
    """Return all unique authors sorted alphabetically."""
    author_set = set(q.get("author", "") for q in QUOTES if q.get("author"))
    return jsonify({"authors": sorted(list(author_set))})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
