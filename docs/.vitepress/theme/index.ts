import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import AvailabilityCard from "../components/AvailabilityCard.vue";
import DocsBlock from "../components/DocsBlock.vue";
import LanguageActionTable from "../components/LanguageActionTable.vue";
import ReachGameIcon from "../components/ReachGameIcon.vue";
import Layout from "./Layout.vue";
import "./fonts.css";
import "./style.css";

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component("AvailabilityCard", AvailabilityCard);
    app.component("DocsBlock", DocsBlock);
    app.component("LanguageActionTable", LanguageActionTable);
    app.component("ReachGameIcon", ReachGameIcon);
  },
} satisfies Theme;
