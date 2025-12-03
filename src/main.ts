import { createApp } from "vue";
import App from "./App.vue";
import Plausible from "plausible-tracker";
import "katex/dist/katex.min.css";

// Initialize Plausible Analytics
const { enableAutoPageviews } = Plausible({
  domain: "p.migdal.pl",
  apiHost: "https://plausible.io",
});

enableAutoPageviews();

createApp(App).mount("#app");
