// function injectGhostbarStyles() {
//   const style = document.createElement("style");
//   style.textContent = `
//     #ghostbar-overlay {
//       position: fixed;
//       top: 50%;
//       left: 50%;
//       transform: translate(-50%, -50%);
//       background-color: rgba(255, 255, 255, 0.4);
//       width: 400px;
//       min-height: 300px;
//       border-radius: 12px;
//       box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
//       z-index: 9999;
//       transition: all 0.2s ease-in-out;
//       display: none;
//       backdrop-filter: blur(12px) saturate(180%);
//       -webkit-backdrop-filter: blur(12px) saturate(180%);
//       border: 1px solid rgba(255, 255, 255, 0.3);
//       cursor: move;
//       background-image: linear-gradient(
//         135deg,
//         rgba(255, 255, 255, 0.4),
//         rgba(255, 255, 255, 0.2)
//       );
//     }

//     .ghostbar-overlay-content {
//       padding: 24px;
//       color: #333;
//       font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
//       text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
//     }

//     .ghostbar-header {
//       display: flex;
//       justify-content: space-between;
//       align-items: center;
//       padding-bottom: 12px;
//       border-bottom: 1px solid rgba(0, 0, 0, 0.1);
//       user-select: none;
//     }

//     .ghostbar-title {
//       font-size: 20px;
//       font-weight: 600;
//       color: #1a1a1a;
//     }

//     .ghostbar-close {
//       background: none;
//       border: none;
//       cursor: pointer;
//       padding: 8px;
//       border-radius: 6px;
//       transition: background-color 0.2s;
//     }

//     .ghostbar-close:hover {
//       background-color: rgba(0, 0, 0, 0.05);
//     }

//     .ghostbar-body {
//       user-select: none;
//     }
//   `;
//   document.head.appendChild(style);
// }

// // Create and inject the overlay element
// function createOverlay() {
//   const overlay = document.createElement("div");
//   overlay.id = "ghostbar-overlay";
//   overlay.innerHTML = `
//     <div class="ghostbar-overlay-content">
//       <div class="ghostbar-header">
//         <h2 class="ghostbar-title">Ghost Bar</h2>
//         <button class="ghostbar-close">×</button>
//       </div>
//       <div class="ghostbar-body">
//         <p>Drag to move or use arrow keys.</p>
//         <p>Press Escape to close.</p>
//       </div>
//     </div>
//   `;
//   overlay.style.display = "none";
//   document.body.appendChild(overlay);

//   // Add keyboard movement functionality
//   let position = { x: 0, y: 0 };
//   const moveSpeed = 10;

//   function handleKeyDown(e) {
//     if (!overlay.style.display || overlay.style.display === "none") return;

//     switch (e.key) {
//       case "ArrowUp":
//         position.y -= moveSpeed;
//         break;
//       case "ArrowDown":
//         position.y += moveSpeed;
//         break;
//       case "ArrowLeft":
//         position.x -= moveSpeed;
//         break;
//       case "ArrowRight":
//         position.x += moveSpeed;
//         break;
//       case "Escape":
//         toggleOverlay();
//         return;
//     }

//     updatePosition();
//   }

//   // Add mouse drag functionality
//   let isDragging = false;
//   let dragOffset = { x: 0, y: 0 };

//   function updatePosition() {
//     overlay.style.transform = `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`;
//   }

//   function handleMouseDown(e) {
//     if (e.target === overlay || e.target === overlay.querySelector(".ghostbar-header")) {
//       isDragging = true;
//       const rect = overlay.getBoundingClientRect();
//       dragOffset = {
//         x: e.clientX - rect.left,
//         y: e.clientY - rect.top,
//       };
//       overlay.style.transition = "none";
//     }
//   }

//   function handleMouseMove(e) {
//     if (!isDragging) return;

//     const x = e.clientX - dragOffset.x;
//     const y = e.clientY - dragOffset.y;

//     position = {
//       x: x - window.innerWidth / 2 + overlay.offsetWidth / 2,
//       y: y - window.innerHeight / 2 + overlay.offsetHeight / 2,
//     };

//     updatePosition();
//   }

//   function handleMouseUp() {
//     if (isDragging) {
//       isDragging = false;
//       overlay.style.transition = "all 0.2s ease-in-out";
//     }
//   }

//   // Add mouse event listeners
//   overlay.addEventListener("mousedown", handleMouseDown);
//   document.addEventListener("mousemove", handleMouseMove);
//   document.addEventListener("mouseup", handleMouseUp);

//   // Add close button functionality
//   const closeButton = overlay.querySelector(".ghostbar-close");
//   if (closeButton) {
//     closeButton.addEventListener("click", toggleOverlay);
//   }

//   // Add keyboard event listener
//   document.addEventListener("keydown", handleKeyDown);

//   return overlay;
// }

// // Toggle overlay visibility
// function toggleOverlay() {
//   const overlay = document.getElementById("ghostbar-overlay") || createOverlay();
//   const isVisible = overlay.style.display === "block";
//   overlay.style.display = isVisible ? "none" : "block";
//   overlay.style.opacity = isVisible ? "0" : "1";
// }

// // Listen for messages from the extension
// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   if (message.action === "toggleOverlay") {
//     toggleOverlay();
//   }
//   return true;
// });

// // Initialize the overlay
// createOverlay();
// injectGhostbarStyles();

import { createApp } from "vue";
import App from "./App.vue";

const root = document.createElement("div");
root.id = "crx-root";
document.body.append(root);

const app = createApp(App);
app.mount(root);
