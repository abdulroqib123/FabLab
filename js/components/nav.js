document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.querySelector(".menu-toggle");
  const navMenu = document.querySelector(".nav-menu");

  if(!menuToggle || !navMenu) return;

  // Modern Mobile Menu Toggle Solution
  menuToggle.addEventListener("click", () => {
    navMenu.classList.toggle("active");
    menuToggle.textContent = navMenu.classList.contains("active") ? "✕" : "☰";
  });

});

 function populateNav() {
  const navMenu = document.getElementById("navMenu");

  if(!navMenu) return;

  navMenu.innerHTML = `
   <!--1. Home (Single Link)-->
          <a href="index.html">Start</a>

  <!-- 2. Die Idee (Single Link) -->
  <a href="idee.html">Die Idee</a>

  <!-- 3. Projekte (Single Link) -->
  <a href="projekte.html">Projekte</a>

  <!-- 4. MINTsteps (Dropdown - 1 Item) -->
  <a href="workshops.html">Workshops</a>
  
  
  <!-- 5. Workshops (Single Link) -->
  <div class="dropdown">
    <a href="mint-steps.html" class="dropdown-trigger">MINTsteps</a>
    <div class="sub-menu">
      <a href="mintsteps-projekte.html">MINTsteps Projekte</a>
    </div>
  </div>

  <!-- 6. Die Werkstatt (Dropdown - Reorganized) -->
  <div class="dropdown">
    <a href="werkstatt.html" class="dropdown-trigger">Die Werkstatt</a>
    <div class="sub-menu">
      <!-- High-level workshop sections -->
      <a href="maschinen.html">Alle Maschinen & Werkzeuge</a>
      
      <!-- Spatial Zones grouped logically together -->
      <hr class="dropdown-divider">
      <a href="elektronik-ecke.html">Elektrotechnik Ecke</a>
      <a href="werkbänke.html">Werkbänke & Handwerk</a>
    </div>
  </div>

  <!-- 7. Mitglied werden (Dropdown - 1 Item) -->
  <div class="dropdown">
    <a href="mitglied-werden.html" class="dropdown-trigger btn-nav">Mitglied werden</a>
    <div class="sub-menu">
      <a href="mitglied-werden.html#satzung">Satzung (e.V.)</a>
    </div>
  </div>

  <!-- 8. Spenden (Single Link Button) -->
  <a href="spenden.html" class="btn-nav btn-alt">Spenden</a>
  `;
}
populateNav();