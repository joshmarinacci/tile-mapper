import { Point } from "josh_js_util"
import React, { useState } from "react"

import { ImagePalette } from "../common/common"
import { ListView, ListViewDirection } from "../common/ListView"
import { PropSheet } from "../common/propsheet"
import { appendToList, useWatchAllProps, useWatchProp } from "../model/base"
import { PixelFont, PixelGlyph } from "../model/datamodel"
import { GlobalState } from "../state"
import { PixelFontPreview } from "./PixelFontPreview"
import { PixelGlyphEditor } from "./PixelGlyphEditor"
import { GlyphDrawOptions, PixelGlyphRenderer } from "./PixelGlyphRenderer"

export function drawGlyph(
  ctx: CanvasRenderingContext2D,
  glyph: PixelGlyph,
  point: Point,
  color: string,
  sc: number,
) {
  const size = glyph.getPropValue("size")
  for (let i = 0; i < size.w; i++) {
    for (let j = 0; j < size.h; j++) {
      const v: number = glyph.getPropValue("data").get(new Point(i, j))
      if (v >= 0) {
        ctx.fillStyle = color
        ctx.fillRect((i + point.x) * sc, (j + point.y) * sc, sc, sc)
      }
    }
  }
}

export function PixelFontEditorView(props: {
  state: GlobalState
  font: PixelFont
}) {
  const [selected, setSelected] = useState<PixelGlyph | undefined>()
  const [drawNames, setDrawNames] = useState(true)
  const palette: ImagePalette = {
    name: "B",
    colors: ["#000000", "#ff0000"],
  }

  const add_glyph = () => {
    const glyph = new PixelGlyph({ name: "X" })
    glyph.getPropValue("data").fill((n) => -1)
    appendToList(props.font, "glyphs", glyph)
  }
  const toggle_draw_names = () => {
    setDrawNames(!drawNames)
  }
  useWatchProp(props.font, "glyphs")
  useWatchAllProps(props.font)
  const opts: GlyphDrawOptions = {
    drawNames: drawNames,
  }
  return (
    <div className={"hbox"}>
      <div className={"vbox"} style={{ maxWidth: "300px" }}>
        <div className={"toolbar"}>
          <button onClick={add_glyph}>add glyph</button>
          <button onClick={toggle_draw_names}>names</button>
        </div>
        <ListView
          selected={selected}
          setSelected={setSelected}
          renderer={PixelGlyphRenderer}
          data={props.font.getPropValue("glyphs")}
          className={"foo"}
          direction={ListViewDirection.HorizontalWrap}
          options={opts}
        />
        <PropSheet target={selected} collapsable={true} />
        <PixelFontPreview font={props.font} />
      </div>
      {selected && <PixelGlyphEditor glyph={selected} palette={palette} />}
    </div>
  )
}
