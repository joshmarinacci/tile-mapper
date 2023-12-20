import { ArrayGrid, Size } from "josh_js_util"

import { DefList, PropDef, PropDefBuilder, PropsBase, PropValues } from "./base"
import { ArrayGridNumberDef, IntegerDef, NameDef, ObjectListDef, SizeDef } from "./datamodel"

type PixelGlyphType = {
  name: string
  codepoint: number
  size: Size
  baseline: number
  ascent: number
  descent: number
  left: number
  right: number
  data: ArrayGrid<number>
}
export const PixelGlyphDefs: DefList<PixelGlyphType> = {
  name: NameDef,
  codepoint: IntegerDef.copy().withDefault(() => 65),
  size: SizeDef.copy().withDefault(() => new Size(16, 16)),
  baseline: IntegerDef.copy().withDefault(() => 12),
  ascent: IntegerDef.copy().withDefault(() => 10),
  descent: IntegerDef.copy().withDefault(() => 2),
  left: IntegerDef.copy().withDefault(() => 0),
  right: IntegerDef.copy().withDefault(() => 0),
  data: ArrayGridNumberDef.copy()
    .withWatchChildren(true)
    .withDefault(() => new ArrayGrid<number>(16, 16)),
}

export class PixelGlyph extends PropsBase<PixelGlyphType> {
  constructor(opts?: PropValues<PixelGlyphType>) {
    super(PixelGlyphDefs, opts)
  }
}

type PixelFontType = {
  name: string
  glyphs: PixelGlyph[]
}
const PixelGlyphListDef: PropDef<PixelGlyphType[]> = ObjectListDef.copy()
  .withHidden(true)
  .withWatchChildren(true)
export const PixelFontDefs: DefList<PixelFontType> = {
  name: NameDef,
  glyphs: PixelGlyphListDef,
}

export class PixelFont extends PropsBase<PixelFontType> {
  constructor(opts?: PropValues<PixelFontType>) {
    super(PixelFontDefs, opts)
  }
}

export const PixelFontReferenceDef = new PropDefBuilder<string>({
  type: "reference",
  format: (v) => "font",
  default: () => "unknown",
  toJSON: (r, v) => v,
  fromJSON: (r, v) => v.toString(),
}).withCustom("font-reference")

export const PixelFontListDef: PropDefBuilder<PixelFont[]> = ObjectListDef.copy()
  .withHidden(true)
  .withExpandable(true)
