import { createMemoryHistory, createRouter } from "vue-router";

import HomeView from "@/views/home.vue";
import SettingsView from "@/views/settings.vue";

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
