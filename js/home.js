import { workshopCard } from "./components/workshopCard.js";

import { getworkshopsByCount } from "./data/workshopsDb.js";
import { getprojectsByCount } from "./data/projectsDb.js";
import { projectCard } from "./components/projectCard.js";

async function initHome() {
await renderWorkshops();
await renderProjects();

}

await initHome();

async function renderWorkshops() {
const container = document.getElementById("workshopsContainer");
if(!container) return;

container.innerHTML = "";

const workshopsData = await getworkshopsByCount(3);

 if (!workshopsData || workshopsData.length === 0) {
   container.innerHTML = `<p class="muted-text">Es gibt noch keine projekte.</p>`;
   return;
 }

const workshops = await workshopCard(workshopsData);

container.append(workshops);
}

async function renderProjects() {
    const container = document.getElementById("projectsContainer");
    if (!container) return;

    container.innerHTML = "";

    const projectsData = await getprojectsByCount(3);

     if (!projectsData || projectsData.length === 0) {
       container.innerHTML = `<p class="muted-text">Es gibt noch keine projekte.</p>`;
       return;
     }

    const projects = await projectCard(projectsData);

    container.append(projects);
}