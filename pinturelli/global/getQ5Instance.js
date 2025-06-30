// import { testMode } from "../debug/_allModesFlags";

////////////////////////////
//
export default function getQ5Instance(description) {
  const { rootId, containerId } = description;

  // canvas container
  const container = (() => {
  let customContainer = document.querySelector(`#${containerId}`);
    if (customContainer) return customContainer;

    // fallback
    const pg = document.querySelector("main") ?? document.body;
    const fallbackContainer = document.createElement("div");
    fallbackContainer.setAttribute("id", `pinturelli${rootId}`);
    pg.appendChild(fallbackContainer);
    return fallbackContainer;
  })(); // iife

  
  // instance creation
  const q5 = new Q5("instance", container);
  q5._pinturelli = { container }; // mutation!!! tree local memory

  return q5;
}