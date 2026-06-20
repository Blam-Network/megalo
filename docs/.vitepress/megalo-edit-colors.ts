import { MegaloSyntaxItemType } from "../../src/highlight";

/** CSS classes for MegaloEdit semantic roles (colors in theme/style.css). */
export const MEGALO_TOKEN_CLASS: Partial<Record<MegaloSyntaxItemType, string>> = {
  [MegaloSyntaxItemType.Comment]: "megalo-comment",
  [MegaloSyntaxItemType.Keyword]: "megalo-keyword",
  [MegaloSyntaxItemType.Condition]: "megalo-condition",
  [MegaloSyntaxItemType.Action]: "megalo-action",
  [MegaloSyntaxItemType.Number]: "megalo-number",
  [MegaloSyntaxItemType.String]: "megalo-string",
  [MegaloSyntaxItemType.VariableType]: "megalo-type",
  [MegaloSyntaxItemType.NumericConstant]: "megalo-constant",
  [MegaloSyntaxItemType.GameOption]: "megalo-option",
  [MegaloSyntaxItemType.OverrideOption]: "megalo-override",
  [MegaloSyntaxItemType.MapObjectProperty]: "megalo-property",
};

export const MEGALO_DEFAULT_CLASS = "megalo-text";
