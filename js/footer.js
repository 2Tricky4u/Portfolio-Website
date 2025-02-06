 function adjustContainerHeight() {
  const footer = document.querySelector(".copyright");
  const header = document.querySelector("#header");
  const container = document.querySelector(".container");

  if (footer) {
  const footerHeight = footer.offsetHeight; // Get actual footer height
  header.style.minHeight = `calc(100vh - ${footerHeight}px)`;
  container.style.minHeight = `calc(100vh - ${footerHeight}px)`;
}
}

  // Run when page loads and on resize
  window.addEventListener("load", adjustContainerHeight);
  window.addEventListener("resize", adjustContainerHeight);

