import styles from "./style.css?inline";
import { createApp } from "vue";
import App from "./App.vue";
import { createPinia } from "pinia";

// Create and append shadow host
const shadowHost = document.createElement("div");
shadowHost.id = "ghostbar-shadow-host";
document.body.appendChild(shadowHost);

// Create shadow root
const shadowRoot = shadowHost.attachShadow({ mode: "open" });

// Create container for Vue app
const appContainer = document.createElement("div");
appContainer.id = "crx-root";
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
