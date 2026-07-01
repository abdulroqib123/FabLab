import { workshopCard } from "./components/workshopCard.js";
import { getAllworkshops } from "./data/workshopsDb.js";

async function initWorkshops() {
const container = document.getElementById("workshopsContainer");

container.innerHTML = "";

const workshopsData = await getAllworkshops();

 if (!workshopsData || workshopsData.length === 0) {
   container.innerHTML = `<p class="muted-text">Es gibt noch keine projekte.</p>`;
   return;
 }
 
const workshops = await workshopCard(workshopsData);

container.append(workshops);
}

await initWorkshops();