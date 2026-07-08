// js/admin/documents.js
// Handles upload / list / delete for the standalone documents feature.
// Assumes a shared Supabase client is exported from your existing setup —
// adjust the import path to match your actual file.
import { supabase } from "../../js/supabase.js";

const FUNCTIONS_BASE_URL =
  "https://kpcprtpmhzpguwwnocnu.supabase.co/functions/v1"; // TODO: replace with your project ref

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "image/jpeg",
  "image/png",
  "image/webp",
];

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // keep in sync with the edge function

const uploadBtn = document.getElementById("uploadDocument");
const fileInput = document.getElementById("document-file-input");
const statusEl = document.getElementById("upload-status");
const listEl = document.getElementById("documents-list-container");

function showStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.style.display = "block";
  statusEl.style.color = isError ? "var(--status-busy)" : "var(--text-muted)";
}

function hideStatus() {
  statusEl.style.display = "none";
}

async function getAuthHeader() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Nicht eingeloggt.");
  return { Authorization: `Bearer ${session.access_token}` };
}

// --- Upload ---
// Button click opens the hidden file picker; selecting a file starts the upload immediately.
uploadBtn.addEventListener("click", () => {
  fileInput.click();
});

fileInput.addEventListener("change", async () => {
  const file = fileInput.files[0];
  if (!file) return;

  // Client-side validation mirrors the server checks — purely for fast feedback,
  // the edge function is still the real enforcement point.
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    showStatus(`Dateityp nicht erlaubt: ${file.type}`, true);
    fileInput.value = "";
    return;
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    showStatus(
      `Datei zu groß: ${(file.size / 1024 / 1024).toFixed(1)}MB (max ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB)`,
      true,
    );
    fileInput.value = "";
    return;
  }

  uploadBtn.disabled = true;
  showStatus("Wird hochgeladen …");

  try {
    const authHeader = await getAuthHeader();
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${FUNCTIONS_BASE_URL}/upload-document`, {
      method: "POST",
      headers: authHeader, // don't set Content-Type manually — browser sets multipart boundary
      body: formData,
    });

    const result = await res.json();

    if (!res.ok) {
      throw new Error(result.error || "Upload fehlgeschlagen");
    }

    showStatus("Erfolgreich hochgeladen.");
    fileInput.value = "";
    await loadDocuments();
  } catch (err) {
    showStatus(err.message, true);
  } finally {
    uploadBtn.disabled = false;
  }
});

// --- List ---
async function loadDocuments() {
  const { data: documents, error } = await supabase
    .from("documents")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    listEl.innerHTML = `<p class="text-muted" style="padding: 24px;">Fehler beim Laden der Dokumente.</p>`;
    return;
  }

  if (!documents.length) {
    listEl.innerHTML = `<p class="text-muted" style="padding: 24px;">Noch keine Dokumente hochgeladen.</p>`;
    return;
  }

  listEl.innerHTML = `<div class="documents-grid">${documents
    .map(
      (doc) => `
    <div class="document-card" data-id="${doc.id}">
      <h3>${escapeHtml(doc.original_filename)}</h3>
      <p class="document-meta">${formatFileSize(doc.file_size_bytes)} · ${new Date(doc.created_at).toLocaleDateString("de-DE")}</p>
      <div class="document-card-actions">
        <button class="btn-secondary copy-link-btn" data-url="${doc.file_url}">Link kopieren</button>
        <button class="btn-secondary btn-delete delete-doc-btn" data-id="${doc.id}">Löschen</button>
      </div>
    </div>
  `,
    )
    .join("")}</div>`;

  // Copy link
  listEl.querySelectorAll(".copy-link-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      navigator.clipboard.writeText(btn.dataset.url);
      btn.textContent = "Kopiert!";
      setTimeout(() => (btn.textContent = "Link kopieren"), 1500);
    });
  });

  // Delete
  listEl.querySelectorAll(".delete-doc-btn").forEach((btn) => {
    btn.addEventListener("click", () => handleDelete(btn.dataset.id));
  });
}

// --- Delete ---
async function handleDelete(id) {
  const confirmed = confirm(
    "Dieses Dokument könnte in einem Beitrag verlinkt sein. Nach dem Löschen ist der Link nicht mehr erreichbar. Wirklich löschen?",
  );
  if (!confirmed) return;

  try {
    const authHeader = await getAuthHeader();

    const res = await fetch(`${FUNCTIONS_BASE_URL}/delete-document`, {
      method: "POST",
      headers: { ...authHeader, "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    const result = await res.json();

    if (!res.ok) {
      throw new Error(result.error || "Löschen fehlgeschlagen");
    }

    await loadDocuments();
  } catch (err) {
    alert(`Fehler: ${err.message}`);
  }
}

// --- Helpers ---
function formatFileSize(bytes) {
  if (!bytes) return "–";
  const mb = bytes / 1024 / 1024;
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// Init
loadDocuments();
