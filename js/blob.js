const blob = document.getElementById("blob");

document.addEventListener("pointermove", event => {
  const {pageX, pageY} = event; // Use pageX and pageY to track movement with scroll

  blob.animate({
    left: `${pageX}px`,
    top: `${pageY}px`
  }, {
    duration: 200,
    fill: "forwards"
  });
});
