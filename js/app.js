import { initGlobalArchiveSystem } from "./archive.js";

function initTheme() {
  const themeToggleBtn = document.getElementById("theme-toggle");
  
  // Load saved theme
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "light") {
  document.body.classList.add("light");
}

// Toggle theme
themeToggleBtn.addEventListener("click", () => {
  const isLight = document.body.classList.toggle("light");
  localStorage.setItem("theme", isLight ? "light" : "dark");
});
}

document.addEventListener("DOMContentLoaded", async () => {

  initTheme();
 await initGlobalArchiveSystem();
})
