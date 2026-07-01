import { projectCard } from "./components/projectCard.js";
import { getAllProjects } from "./data/projectsDb.js";

async function initProjects() {
const container = document.getElementById("projectsContainer");
if(!container) return;

container.innerHTML = "";

const projectsData = await getAllProjects();

  if (!projectsData || projectsData.length === 0) {
    container.innerHTML = `<p class="muted-text">Es gibt noch keine projekte.</p>`;
    return;
  }

const workshops = await workshopCard(projectsData);

container.append(workshops);
}

await initProjects();