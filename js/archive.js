import { supabase } from "./supabase.js";
import { machineCard } from "./components/machineCard.js";
import { projectCard } from "./components/projectCard.js";
import { workshopCard } from "./components/workshopCard.js";

export async function initGlobalArchiveSystem() {
  console.log("⚙️ Archive System: Initializing...");
  const selectElement = document.getElementById("archive-select");
  const gridContainer = document.getElementById("archive-grid-container");

  // Guard Clause: Only execute if archive elements exist on the current page layout context
  if (!selectElement || !gridContainer) {
    return;
  }

  const currentYear = new Date().getFullYear(); // 2026

  try {
    // 1. Populate choices dynamically (keeps the default placeholder selected)
    await populateDropdown(selectElement, currentYear);
    
    // 2. Clear out any loading placeholders to leave a clean, neutral canvas area on load
    gridContainer.innerHTML = `
      <div class="archive-prompt" style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 48px 0;">
        Bitte wählen Sie ein Jahr aus, um historische Beiträge anzuzeigen.
      </div>
    `;

    // 3. Bind listener: Content ONLY fetches when a user changes the value manually
    selectElement.addEventListener("change", async (e) => {
      const selectedYear = e.target.value;
      
      if (!selectedYear) {
        // Fallback placeholder if they clear their selection or choose the default label
        gridContainer.innerHTML = `
          <div class="archive-prompt" style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 48px 0;">
            Bitte wählen Sie ein Jahr aus, um historische Beiträge anzuzeigen.
          </div>
        `;
        return;
      }

      console.log(`🔄 Archive System: User requested timeline parameters for: ${selectedYear}`);
      await loadUnifiedGrid(selectedYear, gridContainer);
    });

  } catch (globalError) {
    console.error("❌ Archive System Fatal Crash during initialization:", globalError);
  }
}

async function populateDropdown(selectElement, currentYear) {
  try {
    const [workshopsRes, projectsRes, machinesRes] = await Promise.all([
      supabase.from("workshops").select("event_date"),
      supabase.from("projects").select("event_date"),
      supabase.from("machines").select("created_"),
    ]);

    const uniqueYears = new Set([currentYear]);

    const parseDataYears = (result, dateColumn) => {
      if (result.data && Array.isArray(result.data)) {
        result.data.forEach(item => {
          const timestamp = item[dateColumn];
          if (timestamp) {
            const year = new Date(timestamp).getFullYear();
            uniqueYears.add(year);
          }
        });
      }
    };

    parseDataYears(workshopsRes, "event_date");
    parseDataYears(projectsRes, "event_date");
    parseDataYears(machinesRes, "created_");

    const sortedYears = Array.from(uniqueYears).sort((a, b) => b - a);

    // Keep the dynamic default placeholder selected initially
    selectElement.innerHTML = '<option value="" selected>Jahr auswählen</option>';

    sortedYears.forEach(year => {
      const option = document.createElement("option");
      option.value = year;
      option.textContent = year;
      selectElement.appendChild(option);
    });

  } catch (err) {
    console.error("❌ Failed inside populateDropdown processing thread:", err);
    throw err;
  }
}

async function loadUnifiedGrid(year, gridContainer) {
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
        .gte("created_", startOfYear)
        .lte("created_", endOfYear),
    ]);

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
      const formattedMachines = machinesRes.data.map(m => ({ ...m, title: m.title || m.name }));
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
    console.error("❌ Error encountered rendering items to grid container:", err);
    gridContainer.innerHTML = `<div class="error-text" style="color: var(--status-warn);">Fehler beim Laden des Archivs. Bitte Konsole prüfen.</div>`;
  }
}