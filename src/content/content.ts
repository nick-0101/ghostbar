import styles from "./style.css?inline";
import { createApp } from "vue";
import App from "./App.vue";
import { createPinia } from "pinia";

// Create and append shadow host
const shadowHost = document.createElement("div");
shadowHost.id = "ghostbar-shadow-host";
document.body.appendChild(shadowHost);

const globalStyleElement = document.createElement("style");
globalStyleElement.textContent = `
  .ghostbar-highlighted-selected-element {
    outline: 2px solid rgb(111, 168, 220);
    background: rgba(111, 168, 220, 0.2);
  }
`;
document.head.appendChild(globalStyleElement);

const fonts = document.createElement("link");
fonts.type = "text/css";
fonts.rel = "stylesheet";
fonts.href = "https://fonts.googleapis.com/css2?family=Geist:wght@100..900&display=swap";
document.head.appendChild(fonts);

// Create shadow root
const shadowRoot = shadowHost.attachShadow({ mode: "open" });

// Create container for Vue app
const appContainer = document.createElement("div");
appContainer.id = "crx-root";
appContainer.classList.add("ghostbar-hidden"); // initally hide the modal
shadowRoot.appendChild(appContainer);

// Add styles to shadow root
const styleElement = document.createElement("style");
styleElement.textContent = styles;
shadowRoot.appendChild(styleElement);

// Create and mount Vue app
const app = createApp(App);
app.use(createPinia());
app.mount(appContainer);

// Cleanup function
window.addEventListener("unload", () => {
  app.unmount();
  shadowHost.remove();
});
