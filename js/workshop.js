import { getWorkshopById } from "./data/workshopsDb.js";

const params = new URLSearchParams(window.location.search);
const workshopId = params.get("ws");

async function initWorkshop() {
    if (!workshopId) return (window.location.href = "workshops.html");

    const workshopName = document.getElementById("workshopName");
    const workshopContent = document.getElementById("workshopContent");

    const workshopData = await getWorkshopById(workshopId);
    
    workshopName.textContent = workshopData.title;
    workshopContent.innerHTML = workshopData.content
}
await initWorkshop();