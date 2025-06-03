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
    }
  `;
  document.head.appendChild(style);
}

// Create and inject the overlay element
function createOverlay() {
  console.log("createOverlay");
  const overlay = document.createElement("div");
  overlay.id = "ghostbar-overlay";
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 9999;
    display: none;
  `;
  document.body.appendChild(overlay);
  return overlay;
}

// Toggle overlay visibility
function toggleOverlay() {
  const overlay = document.getElementById("ghostbar-overlay") || createOverlay();
  overlay.style.display = overlay.style.display === "none" ? "block" : "none";
}

// Listen for messages from the extension
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "toggleOverlay") {
    toggleOverlay();
  }
  return true; // Keep the message channel open for async responses
});

// Initialize the overlay
createOverlay();
injectGhostbarStyles();
