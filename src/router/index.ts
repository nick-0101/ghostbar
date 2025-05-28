import { createMemoryHistory, createRouter } from "vue-router";

import HomeView from "@/views/Home.vue";
import SettingsView from "@/views/Settings.vue";

export const ROUTE_NAMES = {
  HOME: "home",
  SETTINGS: "settings",
} as const;

const routes = [
  { path: "/", component: HomeView, name: ROUTE_NAMES.HOME },
  { path: "/settings", component: SettingsView, name: ROUTE_NAMES.SETTINGS },
];

const router = createRouter({
  history: createMemoryHistory(),
  routes,
});

export default router;
