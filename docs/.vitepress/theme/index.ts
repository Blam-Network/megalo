import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import ActionParameters from "../components/ActionParameters.vue";
import AvailabilityCard from "../components/AvailabilityCard.vue";
import DocsBlock from "../components/DocsBlock.vue";
import ReachGameIcon from "../components/ReachGameIcon.vue";
import Layout from "./Layout.vue";
import "./fonts.css";
import "./style.css";

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component("ActionParameters", ActionParameters);
    app.component("AvailabilityCard", AvailabilityCard);
    app.component("DocsBlock", DocsBlock);
    app.component("ReachGameIcon", ReachGameIcon);
  },
} satisfies Theme;
