function injectGhostbarStyles() {
  const style = document.createElement("style");
  style.textContent = `
    #ghostbar-overlay {
      position: fixed;
      top: 0;
      left: 0;
      background-color: rgba(0, 0, 0, 0.6);
      width: 100vw;
      height: 100vh;
      z-index: 9999;
      transition: opacity 0.3s ease-in-out;
      display: none;
    }

    .ghostbar-overlay-content {
      padding:
    }
  `;
  document.head.appendChild(style);
}

// Create and inject the overlay element
function createOverlay() {
  const overlay = document.createElement("div");
  overlay.id = "ghostbar-overlay";
  overlay.innerHTML = `
    <div class="ghostbar-overlay-content">
      some content here
    </div>
  `;
  overlay.style.display = "none";
  document.body.appendChild(overlay);
  return overlay;
}

// Toggle overlay visibility
function toggleOverlay() {
  const overlay = document.getElementById("ghostbar-overlay") || createOverlay();
  const isVisible = overlay.style.display === "block";
  overlay.style.display = isVisible ? "none" : "block";
  overlay.style.opacity = isVisible ? "0" : "1";
}

// Listen for messages from the extension
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "toggleOverlay") {
    toggleOverlay();
  }
  return true;
});

// Initialize the overlay
createOverlay();
injectGhostbarStyles();
