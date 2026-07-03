import { machineCard } from "./components/machineCard.js";
import { getAllMachines } from "./data/machinesDb.js";

async function initMachines() {
const container = document.getElementById("machinesContainer");
if(!container) return;

container.innerHTML = "";

const machinesData = await getAllMachines();

  if (!machinesData || machinesData.length === 0) {
    container.innerHTML = `<p class="muted-text">Es gibt noch keine Maschinen.</p>`;
    return;
  }

const machines = await machineCard(machinesData);

container.append(machines);
}

await initMachines();
