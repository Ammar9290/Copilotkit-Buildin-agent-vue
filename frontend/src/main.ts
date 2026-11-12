import { createApp } from "vue";
import App from "./App.vue";
import { router } from "./router";
import "./styles/globals.css";
// Quickstart: import the package stylesheet once in the app entry.
import "@copilotkit/vue/styles.css";

createApp(App).use(router).mount("#app");
