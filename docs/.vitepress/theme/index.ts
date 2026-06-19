import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import LanguageActionTable from "../components/LanguageActionTable.vue";
import Layout from "./Layout.vue";
import "./fonts.css";
import "./style.css";

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component("LanguageActionTable", LanguageActionTable);
  },
} satisfies Theme;
