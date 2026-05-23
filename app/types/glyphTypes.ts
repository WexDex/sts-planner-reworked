export type CustomGlyphSource =
  | { type: "lucide"; iconName: string }
  | { type: "svg"; svgData: string }
  | { type: "url"; url: string; cachedSvg?: string };

export type CustomGlyphFieldLink =
  | { mode: "none" }
  | { mode: "boolean"; fieldName: string }
  | { mode: "numeric"; fieldName: string; showNumber: boolean }
  | { mode: "presence"; fieldName: string }
  | { mode: "string-equals"; fieldName: string; matchValue: string };

export type CustomGlyph = {
  key: string;
  shortLabel: string;
  iconClass: string;
  source: CustomGlyphSource;
  fieldLink: CustomGlyphFieldLink;
  hideNumber?: boolean;
  tooltip?: string;
};
