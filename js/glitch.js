const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";


document.querySelectorAll(".scramble-effect").forEach(elem => {
  const originalText = elem.innerText; // Store original text

  elem.onmouseover = event => {
    let iteration = 0;
    console.log(originalText);
    let interval = setInterval(() => {
      event.target.innerText = originalText
        .split("")
        .map((letter, index) => {
          if (index < iteration) {
            return originalText[index];
          }
          return letters[Math.floor(Math.random() * 26)];
        })
        .join("");

      if (iteration >= originalText.length) {
        clearInterval(interval);
      }

      iteration += 1 / 3;
    }, 30);
  };
});
