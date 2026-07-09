import { getProjectById } from "./data/projectsDb.js";
import { createTextPreview } from "./utils/textPreview.js";

const params = new URLSearchParams(window.location.search);
const projectId = params.get("pj");

async function initProject() {
if(!projectId) return window.location.href = "projekte.html";

    const projectName = document.getElementById("projectName");
    const projectContent = document.getElementById("projectContent");

    const projectData = await getProjectById(projectId);
    
      if (!projectData) {
        projectContent.innerHTML = `<p style="color: var(--status-warn); font-size: 0.8rem; text-align: center;">Der Projekt, den Sie suchen, existiert nicht oder wurde gelöscht.</p>`;
        return;
      }

      const metaDesc = document.createElement("meta");
      metaDesc.name = "description";
      metaDesc.content = createTextPreview(projectData.content || "", 120)
      document.querySelector("head").appendChild(metaDesc);

      
    projectName.textContent = projectData.title;
    projectContent.innerHTML = projectData.content;

    const imgs = document.querySelectorAll("#projectContent img");
    imgs.forEach((img) => {
        img.alt = `Foto von das ${projectData.title} Projekt`
    })
}
await initProject();