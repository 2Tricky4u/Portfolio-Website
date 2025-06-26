document.addEventListener('DOMContentLoaded', function() {
  // Flag to track if the video is already playing
  let isVideoPlaying = false;

  // Function to trigger the hover effect
  function triggerHoverEffect() {
    const videoPopup = document.getElementById('videoPopup');
    const iframe = document.getElementById('videoIframe');

    // Only play the video if it isn't already playing
    if (!isVideoPlaying) {
      iframe.src = 'https://www.youtube.com/embed/3y6X-bz8nNo?autoplay=1';
      videoPopup.style.display = 'flex';
      isVideoPlaying = true;  // Set the flag to true once the video starts
    }
  }

  // Function to close the video popup and stop the video
  function closeVideoPopup() {
    const videoPopup = document.getElementById('videoPopup');
    const iframe = document.getElementById('videoIframe');

    iframe.src = '';  // Stop the video
    videoPopup.style.display = 'none';  // Hide the popup
    isVideoPlaying = false;  // Reset the flag when video is closed
  }

  // Event listener for hover effect
  const hoverElement = document.querySelector('.hover-element');
  if (hoverElement) {
    hoverElement.addEventListener('mouseenter', function() {
      triggerHoverEffect();  // Trigger the hover effect
    });
  }

  // Event listener for the close button
  const closeButton = document.querySelector('.video-close-btn');
  if (closeButton) {
    closeButton.addEventListener('click', function() {
      closeVideoPopup();  // Close the video popup
    });
  }

  // Expose the functions for manual triggering via the console
  window.triggerHoverEffect = triggerHoverEffect;
  window.closeVideoPopup = closeVideoPopup;
});
