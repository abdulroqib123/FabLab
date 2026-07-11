// js/content-compat.js
// Bridges old Quill-authored content (raw HTML string) and new block-editor
// content (JSON array, stored as a string in the same `content` column).
// No database migration needed — this just reads whichever shape is there.

import { renderBlocks } from "./render-blocks.js";

// Returns { isBlocks: boolean, blocks: [] | null, html: string | null }
export function parseContent(raw) {
  if (!raw) return { isBlocks: false, blocks: null, html: "" };

  // New content is saved as JSON.stringify(blocks) — try that first.
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return { isBlocks: true, blocks: parsed, html: null };
      }
    } catch {
      // Not valid JSON — this is a legacy Quill HTML string, fall through.
    }
    return { isBlocks: false, blocks: null, html: raw };
  }

  // Already an array (e.g. if a jsonb column is ever introduced later)
  if (Array.isArray(raw)) {
    return { isBlocks: true, blocks: raw, html: null };
  }

  return { isBlocks: false, blocks: null, html: "" };
}

// For the project/workshop detail page — returns final HTML to set via innerHTML
export function renderContent(raw) {
  const parsed = parseContent(raw);
  return parsed.isBlocks ? renderBlocks(parsed.blocks) : parsed.html;
}

// For card previews and meta descriptions — returns a plain HTML-ish string
// suitable for passing into createTextPreview(), same as before.
// For block content, only text blocks contribute (images/carousels have no text).
export function getPreviewSource(raw) {
  const parsed = parseContent(raw);
  if (!parsed.isBlocks) return parsed.html;
  return parsed.blocks
    .filter((b) => b.type === "text")
    .map((b) => b.content)
    .join(" ");
}

// For loading existing content back into the block editor for editing.
// Legacy HTML gets wrapped as a single editable text block — fully editable,
// and will be saved in the new block format from then on.
export function contentToBlocks(raw) {
  const parsed = parseContent(raw);
  if (parsed.isBlocks) return parsed.blocks;
  if (!parsed.html) return [];
  return [{ type: "text", content: parsed.html }];
}
