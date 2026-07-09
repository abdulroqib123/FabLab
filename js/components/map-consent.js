/**
 * map-consent.js
 * Click-to-load wrapper for embedded Google Maps iframes.
 * No connection to Google is made until the user clicks "Karte laden".
 *
 * Usage in HTML:
 * <div class="map-consent" data-map-embed="https://www.google.com/maps/embed?pb=...">
 *   <button type="button" class="map-consent-btn">
 *     <span class="map-consent-icon">📍</span>
 *     Karte laden
 *     <span class="map-consent-note">
 *       Beim Laden wird eine Verbindung zu Google-Servern hergestellt.
 *     </span>
 *   </button>
 * </div>
 *
 * Include once per page (same pattern as nav.js):
 * <script src="js/components/map-consent.js" type="module" defer></script>
 */

function initMapConsent(container) {
  const btn = container.querySelector(".map-consent-btn");
  const embedUrl = container.dataset.mapEmbed;

  if (!btn || !embedUrl) return;

  btn.addEventListener("click", () => {
    const iframe = document.createElement("iframe");
    iframe.src = embedUrl;
    iframe.width = "100%";
    iframe.height = "450";
    iframe.style.border = "0";
    iframe.style.borderRadius = "8px";
    iframe.loading = "lazy";
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    iframe.allowFullscreen = true;
    iframe.setAttribute("allowfullscreen", "");
    iframe.setAttribute(
      "aria-label",
      "Google Maps Karte: FabLab Bremen Standort"
    );

    container.replaceChildren(iframe);
  });
}

document
  .querySelectorAll(".map-consent")
  .forEach((container) => initMapConsent(container));
