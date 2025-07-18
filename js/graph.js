document.addEventListener('DOMContentLoaded', function() {
  let isVideoPlaying = false;

  function triggerHoverEffect() {
    const videoPopup = document.getElementById('videoPopup');
    const iframe = document.getElementById('videoIframe');

    if (!isVideoPlaying) {
      iframe.src = 'https://www.youtube.com/embed/3y6X-bz8nNo?autoplay=1';
      videoPopup.style.display = 'flex';
      isVideoPlaying = true;
    }
  }

  function closeVideoPopup() {
    const videoPopup = document.getElementById('videoPopup');
    const iframe = document.getElementById('videoIframe');

    iframe.src = '';
    videoPopup.style.display = 'none';
    isVideoPlaying = false;
  }

  // Optional: remove hover behavior if you're replacing it entirely
  // const hoverElement = document.querySelector('.hover-element');
  // if (hoverElement) {
  //   hoverElement.addEventListener('mouseenter', function() {
  //     triggerHoverEffect();
  //   });
  // }

  // Bind play button(s)
  const playButtons = document.querySelectorAll('.xp-play-btn');
  playButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      triggerHoverEffect();
    });
  });

  // Close button inside the video popup
  const closeButton = document.querySelector('.video-close-btn');
  if (closeButton) {
    closeButton.addEventListener('click', function() {
      closeVideoPopup();
    });
  }

  // Expose for manual testing
  window.triggerHoverEffect = triggerHoverEffect;
  window.closeVideoPopup = closeVideoPopup;
});
