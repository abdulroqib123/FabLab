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