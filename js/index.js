document.addEventListener("DOMContentLoaded", function () {
  const cmdWindow = document.querySelector(".cmd-container");
  const resizeHandle = document.querySelector(".resize-handle");

  let isResizing = false;

  resizeHandle.addEventListener("mousedown", function (e) {
    e.preventDefault();
    isResizing = true;
    document.addEventListener("mousemove", resizeWindow);
    document.addEventListener("mouseup", stopResizing);
  });

  function resizeWindow(e) {
    if (isResizing) {
      const newWidth = e.clientX - cmdWindow.offsetLeft;
      const newHeight = e.clientY - cmdWindow.offsetTop;

      // Set minimum limits
      if (newWidth > 300) cmdWindow.style.width = newWidth + "px";
      if (newHeight > 200) cmdWindow.style.height = newHeight + "px";
    }
  }

  function stopResizing() {
    isResizing = false;
    document.removeEventListener("mousemove", resizeWindow);
    document.removeEventListener("mouseup", stopResizing);
  }
});
document.addEventListener("DOMContentLoaded", function () {
  const cmdWindow = document.querySelector(".cmd-container");
  const closeButton = document.getElementById("close-btn");

  closeButton.addEventListener("click", function () {
    cmdWindow.classList.add("hidden");
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const cmdWindow = document.querySelector(".cmd-container");
  const titleBar = document.querySelector(".cmd-title-bar");

  let isDragging = false;
  let offsetX, offsetY;

  titleBar.addEventListener("mousedown", function (e) {
    isDragging = true;
    offsetX = e.clientX - cmdWindow.offsetLeft;
    offsetY = e.clientY - cmdWindow.offsetTop;
    cmdWindow.style.cursor = "grabbing";
  });

  document.addEventListener("mousemove", function (e) {
    if (isDragging) {
      cmdWindow.style.left = e.clientX - offsetX + "px";
      cmdWindow.style.top = e.clientY - offsetY + "px";
    }
  });

  document.addEventListener("mouseup", function () {
    isDragging = false;
    cmdWindow.style.cursor = "grab";
  });
});

function updateLoadingBar() {
  const scrollTop = document.documentElement.scrollTop;
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrollPercentage = scrollTop / scrollHeight;

  const browserWidth = document.documentElement.clientWidth;
  const browserHeight = document.documentElement.clientHeight;
  const totalSlots = Math.floor(browserWidth / 4.5);
  const filledSlots = Math.round(scrollPercentage * totalSlots);

  let bar = "[ ";
  for (let i = 0; i < totalSlots; i++) {
    bar += (i < filledSlots) ? "█" : ".";
  }
  bar += " ]";

  document.getElementById("loading-bar").innerText = bar;
}

// Update on scroll and resize
document.addEventListener("scroll", updateLoadingBar);
window.addEventListener("resize", updateLoadingBar);
updateLoadingBar();

