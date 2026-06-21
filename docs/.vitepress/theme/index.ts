import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import ActionParameters from "../components/ActionParameters.vue";
import ActionSupportedVersions from "../components/ActionSupportedVersions.vue";
import AvailabilityCard from "../components/AvailabilityCard.vue";
import VersionLimits from "../components/VersionLimits.vue";
import DocsBlock from "../components/DocsBlock.vue";
import EnumVersionTable from "../components/EnumVersionTable.vue";
import GameLabel from "../components/GameLabel.vue";
import ReachGameIcon from "../components/ReachGameIcon.vue";
import Layout from "./Layout.vue";
import NotFound from "./NotFound.vue";
import "./fonts.css";
import "./style.css";

export default {
  extends: DefaultTheme,
  Layout,
  NotFound,
  enhanceApp({ app }) {
    app.component("ActionParameters", ActionParameters);
    app.component("ActionSupportedVersions", ActionSupportedVersions);
    app.component("AvailabilityCard", AvailabilityCard);
    app.component("VersionLimits", VersionLimits);
    app.component("DocsBlock", DocsBlock);
    app.component("EnumVersionTable", EnumVersionTable);
    app.component("GameLabel", GameLabel);
    app.component("ReachGameIcon", ReachGameIcon);
  },
} satisfies Theme;
