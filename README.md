# Famous Quotes Web Application

A responsive, lightweight single-page web application displaying random quotes from a curated collection of 100 well-known quotes. Features live author searching, category filtering, and quote copying.

Built with **Python Flask**, **plain vanilla JavaScript**, **HTML5**, and **CSS3**.

---

## Features
- **Quote of the Moment**: Hero display showing an inspirational random quote with smooth fade animations.
- **Random Quote Generation**: Refresh new random quotes instantly, optionally scoped to active categories.
- **Real-Time Author & Keyword Search**: Debounced instant search across author names and quote contents.
- **Category Filter Pills**: Filter across 8 categories (*Science, Philosophy, Technology, Literature, Leadership, Art, Wisdom, Inspiration*) with real-time count badges.
- **Copy to Clipboard**: Quick-copy buttons for the hero quote and individual quote cards with toast alerts.
- **Interactive Card Selection**: Click any quote in the grid to promote it to the featured hero card.

---

## Project Structure

```
famous-quotes/
├── app.py                  # Flask server and REST API endpoints
├── data/
│   └── quotes.json         # 100 curated quotes with id, author, category
├── static/
│   ├── css/
│   │   └── style.css       # Responsive dark-theme styling and animations
│   └── js/
│       └── app.js          # Pure vanilla JavaScript frontend logic
├── templates/
│   └── index.html          # Semantic HTML5 layout
├── test_app.py             # Automated unit and integration test suite
└── requirements.txt        # Python dependencies
```

---

## Quickstart

### 1. Run the Web Application
```bash
python3 app.py
```
Open your browser and navigate to:
```
http://localhost:5000
```

### 2. Run the Test Suite
```bash
python3 -m unittest -v test_app.py
```

---

## REST API Endpoints

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/` | `GET` | Main web page |
| `/api/quote/random` | `GET` | Returns a random quote (`?category=...`, `?author=...`) |
| `/api/quotes` | `GET` | List/search quotes (`?author=...`, `?category=...`, `?q=...`) |
| `/api/categories` | `GET` | List categories and quote counts |
| `/api/authors` | `GET` | List all unique author names |
