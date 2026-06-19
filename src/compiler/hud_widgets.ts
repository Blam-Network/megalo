import type { MegaloProgram } from "../ast";
import { parseMegaloHudWidgetPosition } from "../lookups";

/** Compile `hud_widgets` section entries into `m_hud_widgets` position indices. */
export function compileHudWidgetsFromProgram(program: MegaloProgram): number[] {
  const section = program.sections.find((entry) => entry.type === "hud_widgets");
  if (!section || section.type !== "hud_widgets") {
    return [];
  }
  return section.widgets.map((widget) =>
    parseMegaloHudWidgetPosition(widget.position)
  );
}

export function programHasHudWidgets(program: MegaloProgram): boolean {
  return program.sections.some((entry) => entry.type === "hud_widgets");
}
