import "./style.css";
chrome.runtime.getURL("./style.css");
import { createApp } from "vue";
import App from "./App.vue";
import { createPinia } from "pinia";

const root = document.createElement("div");
root.id = "crx-root";
document.body.append(root);

const app = createApp(App);
app.use(createPinia());
app.mount(root);
