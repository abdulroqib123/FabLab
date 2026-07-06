import {
  getAllMachines,
} from "./data/machinesDb.js";
import {
  getAllProjects,
} from "./data/projectsDb.js";
import {
  getAllworkshops,
} from "./data/workshopsDb.js";


// --- Global State ---
let searchableData = [];

// --- 1. Debounce Utility ---
function debounce(func, delay = 1000) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

// --- 2. Data Normalizer ---
// Maps different database columns (e.g., 'name' vs 'title') into a standard format
function normalizeData(dataArray, type, titleKey) {
  if (!dataArray) return [];
  return dataArray.map((item) => ({
    id: item.id,
    title: item[titleKey] || "Untitled", // Uses the specific key for the title
    type: type,
    raw: item, // Keep raw data in case you need it for navigation later
  }));
}

// --- 3. Pre-fetch and Normalize ---
async function prepareSearchData() {
  const [machines, projects, workshops] = await Promise.all([
    getAllMachines(),
    getAllProjects(),
    getAllworkshops(),
  ]);

  // Assuming machines use 'name' and others use 'title'. Adjust keys as needed based on your DB schema.
  searchableData = [
    ...normalizeData(machines, "Machine", "name"),
    ...normalizeData(projects, "Project", "title"),
    ...normalizeData(workshops, "Workshop", "title"),
  ];
}

// --- 4. DOM Manipulation (The Overlay) ---
function openSearchOverlay() {
  // Check if it already exists to prevent duplicates
  if (document.getElementById("fablab-search-overlay")) return;

  // 1. Create Overlay
  const overlay = document.createElement("div");
  overlay.id = "fablab-search-overlay";
  overlay.classList.add("search-overlay");

  // 2. Create Container
  const container = document.createElement("div");
  container.classList.add("search-container");

  // 3. Create Header & Close Button
  const header = document.createElement("div");
  header.classList.add("search-header");

  const closeBtn = document.createElement("button");
  closeBtn.textContent = "✕ Close";
  closeBtn.style.cursor = "pointer";
  closeBtn.onclick = () => document.body.removeChild(overlay);

  // 4. Create Input
  const input = document.createElement("input");
  input.type = "text";
  input.classList.add("search-input");
  input.placeholder = "Search machines, projects, workshops...";

  // 5. Create Results Section
  const resultsContainer = document.createElement("ul");
  resultsContainer.classList.add("search-results");

  // --- Search Logic ---
  const handleSearch = debounce((e) => {
    const query = e.target.value.toLowerCase().trim();
    resultsContainer.innerHTML = ""; // Clear previous results

    if (!query) return;

    // Filter normalized data
    const filteredResults = searchableData.filter((item) =>
      item.title.toLowerCase().includes(query),
    );

    if (filteredResults.length === 0) {
      resultsContainer.innerHTML =
        '<li class="search-result-item" style="justify-content: center; color: #666;">No matches found.</li>';
      return;
    }

    // Render Results
    filteredResults.forEach((item) => {
      const li = document.createElement("li");
      li.classList.add("search-result-item");

      const titleSpan = document.createElement("span");
      titleSpan.textContent = item.title;

      const badgeSpan = document.createElement("span");
      badgeSpan.textContent = item.type;
      badgeSpan.classList.add("badge", item.type.toLowerCase());

      li.append(titleSpan, badgeSpan);

      const link = document.createElement("a");
      if (item.type === "Machine") {
        link.href = `maschine.html?mc=${item.id}`;
      } else if (item.type === "Project") {
        link.href = `projekt.html?pj=${item.id}`;
      } else if (item.type === "Workshop") {
        link.href = `workshop.html?ws=${item.id}`;
      }

      link.appendChild(li);
      resultsContainer.appendChild(link);
    });
  }, 300);

  // Attach Events
  input.addEventListener("input", handleSearch);

  // Close overlay on clicking outside the container
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) document.body.removeChild(overlay);
  });

  // Assemble the DOM
  header.appendChild(closeBtn);
  container.append(header, input, resultsContainer);
  overlay.appendChild(container);
  document.body.appendChild(overlay);

  // Auto-focus input
  input.focus();
}

// --- 5. Initialization ---
// Call this when your app loads
export function initSearch() {
  prepareSearchData(); // Start fetching in the background

  const searchButton = document.getElementById("searchBtn");
  if (searchButton) {
    searchButton.addEventListener("click", openSearchOverlay);
  }
}
