const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

document.querySelectorAll(".scramble-effect, .btn, .tab-links").forEach(elem => {
  const originalText = elem.getAttribute("data-text");
  if (!originalText) return;


  elem.onmouseover = event => {
    let iteration = 0;
    let interval = setInterval(() => {
      let displayText;

      if (event.target.tagName === "INPUT" || event.target.tagName === "BUTTON") {
        displayText = event.target.value;
      } else if (event.target.tagName === "P" || event.target.tagName === "A" || event.target.tagName === "SPAN" || event.target.tagName === "DIV") {
        displayText = event.target.textContent;
      } else {
        displayText = event.target.innerText;
      }

      displayText = originalText
        .split("")
        .map((letter, index) => {
          if (index < iteration) {
            return originalText[index];
          }
          return letters[Math.floor(Math.random() * 26)];
        })
        .join("");

      if (event.target.tagName === "INPUT" || event.target.tagName === "BUTTON") {
        event.target.value = displayText;
      } else {
        event.target.textContent = displayText;
      }

      if (iteration >= originalText.length) {
        clearInterval(interval);
      }

      iteration += 1 / 3;
    }, 30);
  };
});
