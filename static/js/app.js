/**
 * Famous Quotes Web Application
 * Vanilla JavaScript Frontend Client
 */

document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const heroQuote = document.getElementById("heroQuote");
  const heroAuthor = document.getElementById("heroAuthor");
  const heroCategory = document.getElementById("heroCategory");
  const btnNewQuote = document.getElementById("btnNewQuote");
  const btnCopyHero = document.getElementById("btnCopyHero");

  const authorSearch = document.getElementById("authorSearch");
  const btnClearSearch = document.getElementById("btnClearSearch");
  const categoriesBar = document.getElementById("categoriesBar");
  const resultsCount = document.getElementById("resultsCount");
  const btnResetFilters = document.getElementById("btnResetFilters");
  const quotesGrid = document.getElementById("quotesGrid");
  const emptyState = document.getElementById("emptyState");
  const btnEmptyReset = document.getElementById("btnEmptyReset");
  const toast = document.getElementById("toast");

  // State
  let currentHeroQuoteData = null;
  let activeCategory = "";
  let currentQuery = "";
  let searchDebounceTimeout = null;
  let toastTimeout = null;

  // Initialize
  init();

  async function init() {
    loadRandomQuote();
    loadCategories();
    fetchQuotes();
    setupEventListeners();
  }

  // --- API Functions ---

  /** Fetch and display a random quote in the hero card */
  async function loadRandomQuote(category = "") {
    try {
      let url = "/api/quote/random";
      if (category) {
        url += `?category=${encodeURIComponent(category)}`;
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load quote");
      const data = await res.json();
      displayHeroQuote(data);
    } catch (err) {
      console.error("Error loading random quote:", err);
    }
  }

  /** Fetch category list with counts */
  async function loadCategories() {
    try {
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error("Failed to load categories");
      const data = await res.json();
      renderCategoryPills(data.categories || []);
    } catch (err) {
      console.error("Error loading categories:", err);
    }
  }

  /** Fetch quotes matching query and active category */
  async function fetchQuotes() {
    try {
      const params = new URLSearchParams();
      if (currentQuery.trim()) {
        params.append("q", currentQuery.trim());
      }
      if (activeCategory) {
        params.append("category", activeCategory);
      }

      const url = `/api/quotes?${params.toString()}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch quotes");
      const data = await res.json();

      renderQuotes(data.quotes || []);
    } catch (err) {
      console.error("Error fetching quotes:", err);
    }
  }

  // --- UI Render Functions ---

  function displayHeroQuote(quoteData) {
    currentHeroQuoteData = quoteData;
    heroQuote.style.opacity = "0";

    setTimeout(() => {
      heroQuote.textContent = `“${quoteData.quote}”`;
      heroAuthor.textContent = quoteData.author;
      heroCategory.textContent = quoteData.category || "General";
      heroQuote.style.opacity = "1";
    }, 150);
  }

  function renderCategoryPills(categories) {
    const totalCount = categories.reduce((sum, c) => sum + c.count, 0);

    // Keep the "All" pill and populate others
    categoriesBar.innerHTML = `
      <button class="cat-pill ${activeCategory === "" ? "active" : ""}" data-category="">
        All Quotes <span class="cat-count">${totalCount}</span>
      </button>
    `;

    categories.forEach((cat) => {
      const pill = document.createElement("button");
      pill.className = `cat-pill ${activeCategory === cat.name ? "active" : ""}`;
      pill.dataset.category = cat.name;
      pill.innerHTML = `${cat.name} <span class="cat-count">${cat.count}</span>`;
      categoriesBar.appendChild(pill);
    });
  }

  function renderQuotes(quotes) {
    quotesGrid.innerHTML = "";
    resultsCount.textContent = `Showing ${quotes.length} quote${quotes.length === 1 ? "" : "s"}`;

    const hasFilters = Boolean(currentQuery.trim() || activeCategory);
    btnResetFilters.classList.toggle("hidden", !hasFilters);

    if (quotes.length === 0) {
      quotesGrid.classList.add("hidden");
      emptyState.classList.remove("hidden");
      return;
    }

    quotesGrid.classList.remove("hidden");
    emptyState.classList.add("hidden");

    quotes.forEach((q) => {
      const card = document.createElement("div");
      card.className = "quote-card";
      card.title = "Click to feature this quote";

      card.innerHTML = `
        <div class="card-top">
          <span class="card-badge">${escapeHtml(q.category || "General")}</span>
          <button class="card-copy-btn" title="Copy quote" data-id="${q.id}">📋 Copy</button>
        </div>
        <p class="card-text">“${escapeHtml(q.quote)}”</p>
        <div class="card-author">— ${escapeHtml(q.author)}</div>
      `;

      // Click card body to set as Hero quote
      card.addEventListener("click", (e) => {
        if (e.target.closest(".card-copy-btn")) return;
        displayHeroQuote(q);
        window.scrollTo({ top: 0, behavior: "smooth" });
      });

      // Click copy button on individual card
      const copyBtn = card.querySelector(".card-copy-btn");
      copyBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        copyToClipboard(`“${q.quote}” — ${q.author}`);
      });

      quotesGrid.appendChild(card);
    });
  }

  // --- Helpers & Event Handlers ---

  function setupEventListeners() {
    // New Random Quote Button
    btnNewQuote.addEventListener("click", () => {
      loadRandomQuote(activeCategory);
    });

    // Copy Hero Quote Button
    btnCopyHero.addEventListener("click", () => {
      if (currentHeroQuoteData) {
        copyToClipboard(`“${currentHeroQuoteData.quote}” — ${currentHeroQuoteData.author}`);
      }
    });

    // Search input with debounce
    authorSearch.addEventListener("input", (e) => {
      currentQuery = e.target.value;
      btnClearSearch.classList.toggle("hidden", !currentQuery);

      clearTimeout(searchDebounceTimeout);
      searchDebounceTimeout = setTimeout(() => {
        fetchQuotes();
      }, 200);
    });

    // Clear search button
    btnClearSearch.addEventListener("click", () => {
      authorSearch.value = "";
      currentQuery = "";
      btnClearSearch.classList.add("hidden");
      authorSearch.focus();
      fetchQuotes();
    });

    // Category pills event delegation
    categoriesBar.addEventListener("click", (e) => {
      const pill = e.target.closest(".cat-pill");
      if (!pill) return;

      activeCategory = pill.dataset.category || "";

      document.querySelectorAll(".cat-pill").forEach((p) => {
        p.classList.toggle("active", p === pill);
      });

      fetchQuotes();
    });

    // Reset filters
    btnResetFilters.addEventListener("click", resetAllFilters);
    btnEmptyReset.addEventListener("click", resetAllFilters);
  }

  function resetAllFilters() {
    activeCategory = "";
    currentQuery = "";
    authorSearch.value = "";
    btnClearSearch.classList.add("hidden");

    document.querySelectorAll(".cat-pill").forEach((p) => {
      p.classList.toggle("active", (p.dataset.category || "") === "");
    });

    fetchQuotes();
  }

  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(showToast).catch(() => fallbackCopy(text));
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand("copy");
      showToast();
    } catch (e) {
      console.error("Fallback copy failed", e);
    }
    document.body.removeChild(textarea);
  }

  function showToast() {
    toast.classList.remove("hidden");
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.add("hidden");
    }, 2200);
  }

  function escapeHtml(str) {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
});
