import { supabase } from "./supabase.js";
import { machineCard } from "./components/machineCard.js";
import { projectCard } from "./components/projectCard.js";
import { workshopCard } from "./components/workshopCard.js";

// Bumped on every year-change so stale async responses can be discarded
let activeRequestId = 0;

export async function initGlobalArchiveSystem() {
  const selectElement = document.getElementById("archive-select");
  const gridContainer = document.getElementById("archive-grid-container");

  // Guard Clause: Only execute if archive elements exist on the current page layout context
  if (!selectElement || !gridContainer) {
    return;
  }

  const currentYear = new Date().getFullYear();

  try {
    // 1. Populate choices dynamically (keeps the default placeholder selected)
    await populateDropdown(selectElement, currentYear);

    // 2. Clear out any loading placeholders to leave a clean, neutral canvas area on load
    showPrompt(gridContainer);

    // 3. Bind listener: Content ONLY fetches when a user changes the value manually
    selectElement.addEventListener("change", async (e) => {
      const selectedYear = e.target.value;

      if (!selectedYear) {
        // Fallback placeholder if they clear their selection or choose the default label
        showPrompt(gridContainer);
        return;
      }

      console.log(`🔄 Archive System: User requested timeline parameters for: ${selectedYear}`);

      // Track this request so a slower, older request can't clobber a newer one
      const requestId = ++activeRequestId;
      await loadUnifiedGrid(selectedYear, gridContainer, requestId);
    });

  } catch (globalError) {
    console.error("❌ Archive System Fatal Crash during initialization:", globalError);
    gridContainer.innerHTML = `
      <div class="error-text" style="grid-column: 1 / -1; text-align: center; color: var(--status-warn); padding: 48px 0;">
        Archiv konnte nicht geladen werden. Bitte Seite neu laden oder später erneut versuchen.
      </div>
    `;
  }
}

function showPrompt(gridContainer) {
  gridContainer.innerHTML = `
    <div class="archive-prompt" style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 48px 0;">
      Bitte wählen Sie ein Jahr aus, um historische Beiträge anzuzeigen.
    </div>
  `;
}

async function populateDropdown(selectElement, currentYear) {
  const [workshopsRes, projectsRes, machinesRes] = await Promise.all([
    supabase.from("workshops").select("event_date"),
    supabase.from("projects").select("event_date"),
    supabase.from("machines").select("created_at"),
  ]);

  // Supabase doesn't throw on query errors — it returns { data, error }.
  // Check explicitly, otherwise a failed query silently looks like "no years".
  const errors = [workshopsRes.error, projectsRes.error, machinesRes.error].filter(Boolean);
  if (errors.length) {
    console.error("❌ populateDropdown: Supabase query error(s):", errors);
    throw new Error(`Failed to load year options (${errors.length} of 3 queries failed)`);
  }

  const uniqueYears = new Set([currentYear]);

  const parseDataYears = (result, dateColumn) => {
    if (Array.isArray(result.data)) {
      result.data.forEach(item => {
        const timestamp = item[dateColumn];
        if (timestamp) {
          // Use UTC year so this stays consistent with the UTC range filters
          // used in loadUnifiedGrid (see note below).
          const year = new Date(timestamp).getUTCFullYear();
          uniqueYears.add(year);
        }
      });
    }
  };

  parseDataYears(workshopsRes, "event_date");
  parseDataYears(projectsRes, "event_date");
  parseDataYears(machinesRes, "created_at");

  const sortedYears = Array.from(uniqueYears).sort((a, b) => b - a);

  // Keep the dynamic default placeholder selected initially
  selectElement.innerHTML = '<option value="" selected>Jahr auswählen</option>';

  sortedYears.forEach(year => {
    const option = document.createElement("option");
    option.value = year;
    option.textContent = year;
    selectElement.appendChild(option);
  });
}

async function loadUnifiedGrid(year, gridContainer, requestId) {
  gridContainer.innerHTML = '<div class="loading-text">Lade Archiv-Daten...</div>';

  const startOfYear = `${year}-01-01T00:00:00.000Z`;
  const endOfYear = `${year}-12-31T23:59:59.999Z`;

  try {
    const [workshopsRes, projectsRes, machinesRes] = await Promise.all([
      supabase
        .from("workshops")
        .select("*")
        .gte("event_date", startOfYear)
        .lte("event_date", endOfYear),
      supabase
        .from("projects")
        .select("*")
        .gte("event_date", startOfYear)
        .lte("event_date", endOfYear),
      supabase
        .from("machines")
        .select("*")
        .gte("created_at", startOfYear)
        .lte("created_at", endOfYear),
    ]);

    // Bail out if a newer request has started since this one was kicked off,
    // so a slow response for an old year can't overwrite a newer selection.
    if (requestId !== activeRequestId) return;

    const errors = [workshopsRes.error, projectsRes.error, machinesRes.error].filter(Boolean);
    if (errors.length) {
      console.error("❌ loadUnifiedGrid: Supabase query error(s):", errors);
      gridContainer.innerHTML = `
        <div class="error-text" style="grid-column: 1 / -1; text-align: center; color: var(--status-warn); padding: 48px 0;">
          Fehler beim Laden des Archivs (${errors.length} von 3 Anfragen fehlgeschlagen). Bitte Konsole prüfen.
        </div>
      `;
      return;
    }

    gridContainer.innerHTML = "";
    let totalItemsCount = 0;

    if (workshopsRes.data?.length > 0) {
      gridContainer.appendChild(workshopCard(workshopsRes.data));
      totalItemsCount += workshopsRes.data.length;
    }

    if (projectsRes.data?.length > 0) {
      gridContainer.appendChild(projectCard(projectsRes.data));
      totalItemsCount += projectsRes.data.length;
    }

    if (machinesRes.data?.length > 0) {
      const formattedMachines = machinesRes.data.map(m => ({
        ...m,
        title: m.title || m.name || "Unbenannte Maschine",
      }));
      gridContainer.appendChild(machineCard(formattedMachines));
      totalItemsCount += machinesRes.data.length;
    }

    if (totalItemsCount === 0) {
      gridContainer.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 48px 0;">
          Keine Einträge für das Jahr ${year} gefunden.
        </div>
      `;
    }
  } catch (err) {
    if (requestId !== activeRequestId) return;
    console.error("❌ Error encountered rendering items to grid container:", err);
    gridContainer.innerHTML = `<div class="error-text" style="color: var(--status-warn);">Fehler beim Laden des Archivs. Bitte Konsole prüfen.</div>`;
  }
}