import { createTextPreview } from "../utils/textPreview.js";

export function machineCard(machines) {
  const fragment = document.createDocumentFragment();

  machines.forEach((mc) => {
    const images = mc.image_urls || [];
    const thumbnailImage =
      images.length > 0 ? images[0] : "assets/default-project.jpg";

    const card = document.createElement("div");
    card.classList.add("card");

    const cardTop = document.createElement("div");
    cardTop.classList.add("card-top");
    card.appendChild(cardTop);

    const cardImg = document.createElement("img");
    cardImg.classList.add("card-img");
    cardImg.alt = mc.title;
    cardImg.src = thumbnailImage;
    cardTop.appendChild(cardImg);

    const cardBottom = document.createElement("div");
    cardBottom.classList.add("card-bottom");
    card.appendChild(cardBottom);

    const h3 = document.createElement("h3");
    h3.textContent = mc.name;
    cardBottom.appendChild(h3);

    const cardDesc = document.createElement("p");
    cardDesc.classList.add("card-desc");
    cardDesc.textContent = mc.description;
    cardBottom.appendChild(cardDesc);

    const cardLink = document.createElement("a");
    cardLink.classList.add("card-link", "btn-primary");
    cardLink.href = `/maschine.html?mc=${mc.id}`;
    cardLink.textContent = "Mehr Erfahren";
    cardBottom.appendChild(cardLink);

    fragment.appendChild(card);
  });

  return fragment;
}
