import json
import os
import unittest
from app import app, DATA_FILE


class FamousQuotesTestCase(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()

    def test_quotes_data_integrity(self):
        """Verify that data/quotes.json has exactly 100 quotes with all required fields."""
        self.assertTrue(os.path.exists(DATA_FILE), f"Data file {DATA_FILE} not found.")
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            quotes = json.load(f)

        self.assertEqual(len(quotes), 100, f"Expected 100 quotes, found {len(quotes)}.")

        ids = set()
        for idx, q in enumerate(quotes):
            self.assertIn("id", q, f"Quote at index {idx} missing 'id'")
            self.assertIn("quote", q, f"Quote at index {idx} missing 'quote'")
            self.assertIn("author", q, f"Quote at index {idx} missing 'author'")
            self.assertIn("category", q, f"Quote at index {idx} missing 'category'")

            self.assertTrue(isinstance(q["id"], int), f"ID must be int at index {idx}")
            self.assertTrue(len(q["quote"].strip()) > 0, f"Quote text is empty at index {idx}")
            self.assertTrue(len(q["author"].strip()) > 0, f"Author is empty at index {idx}")
            self.assertTrue(len(q["category"].strip()) > 0, f"Category is empty at index {idx}")

            self.assertNotIn(q["id"], ids, f"Duplicate quote id: {q['id']}")
            ids.add(q["id"])

    def test_index_page(self):
        """Verify the index HTML page loads successfully."""
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        self.assertIn(b"Famous Quotes", response.data)
        self.assertIn(b"Quote of the Moment", response.data)

    def test_random_quote_endpoint(self):
        """Verify GET /api/quote/random returns a valid quote."""
        response = self.client.get("/api/quote/random")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn("id", data)
        self.assertIn("quote", data)
        self.assertIn("author", data)
        self.assertIn("category", data)

    def test_random_quote_with_category(self):
        """Verify GET /api/quote/random with category filter."""
        response = self.client.get("/api/quote/random?category=Science")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data["category"], "Science")

    def test_random_quote_invalid_filter(self):
        """Verify GET /api/quote/random returns 404 for nonexistent category."""
        response = self.client.get("/api/quote/random?category=NonExistentCategory123")
        self.assertEqual(response.status_code, 404)

    def test_get_all_quotes(self):
        """Verify GET /api/quotes returns all 100 quotes."""
        response = self.client.get("/api/quotes")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data["count"], 100)
        self.assertEqual(len(data["quotes"]), 100)

    def test_search_by_author(self):
        """Verify author filtering works case-insensitively."""
        response = self.client.get("/api/quotes?author=einstein")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertGreaterEqual(data["count"], 1)
        for q in data["quotes"]:
            self.assertIn("einstein", q["author"].lower())

    def test_filter_by_category(self):
        """Verify category filtering works correctly."""
        response = self.client.get("/api/quotes?category=Philosophy")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertGreaterEqual(data["count"], 1)
        for q in data["quotes"]:
            self.assertEqual(q["category"].lower(), "philosophy")

    def test_search_by_query_keyword(self):
        """Verify general text query search works."""
        response = self.client.get("/api/quotes?q=electricity")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertGreaterEqual(data["count"], 1)
        self.assertEqual(data["quotes"][0]["author"], "Andrew Ng")

    def test_categories_endpoint(self):
        """Verify /api/categories returns valid category list and total count of 100."""
        response = self.client.get("/api/categories")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn("categories", data)
        total = sum(c["count"] for c in data["categories"])
        self.assertEqual(total, 100)

    def test_authors_endpoint(self):
        """Verify /api/authors returns sorted list of authors."""
        response = self.client.get("/api/authors")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn("authors", data)
        self.assertGreater(len(data["authors"]), 20)
        self.assertIn("Albert Einstein", data["authors"])
        self.assertIn("Andrew Ng", data["authors"])


if __name__ == "__main__":
    unittest.main()
