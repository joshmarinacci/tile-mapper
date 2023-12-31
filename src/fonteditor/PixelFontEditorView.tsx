import { Point } from "josh_js_util"
import { Spacer } from "josh_react_util"
import React, { useContext, useState } from "react"

import { DropdownButton, IconButton, ToggleButton } from "../common/common-components"
import { Icons } from "../common/icons"
import { ListView, ListViewDirection } from "../common/ListView"
import { appendToList, useWatchAllProps, useWatchProp } from "../model/base"
import { StateContext } from "../model/contexts"
import { PixelFont, PixelGlyph } from "../model/pixelfont"
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
  // ctx.strokeStyle = 'black'
  // ctx.lineWidth = 1
  // ctx.strokeRect(point.x*sc, point.y*sc,size.w*sc,size.h*sc)
}

export function PixelFontEditorView(props: { font: PixelFont }) {
  const [selected, setSelected] = useState<PixelGlyph | undefined>()
  const [drawNames, setDrawNames] = useState(true)
  const [scale, setScale] = useState(1)
  const state = useContext(StateContext)

  const add_glyph = () => {
    const glyph = new PixelGlyph({ name: "X" })
    glyph.getPropValue("data").fill(() => -1)
    appendToList(props.font, "glyphs", glyph)
  }
  const toggle_draw_names = () => {
    setDrawNames(!drawNames)
  }
  const sort = () => {
    const glyphs = props.font.getPropValue("glyphs").slice()
    glyphs.sort((a, b) => {
      return a.getPropValue("codepoint") - b.getPropValue("codepoint")
    })
    props.font.setPropValue("glyphs", glyphs)
  }
  useWatchProp(props.font, "glyphs")
  useWatchAllProps(props.font)
  const opts: GlyphDrawOptions = {
    drawNames: drawNames,
    scale: scale,
  }
  return (
    <>
      <div className={"vbox tool-column"} style={{ maxWidth: "300px" }}>
        <div className={"toolbar"}>
          <IconButton
            icon={Icons.Plus}
            onClick={add_glyph}
            text={"glyph"}
            tooltip={"add new font glyph"}
          />
          <ToggleButton
            onClick={toggle_draw_names}
            icon={Icons.Font}
            selected={drawNames}
            text={"names"}
          />
          <IconButton
            onClick={sort}
            text={"sort"}
            icon={Icons.Sort}
            tooltip={"sort glyphs by codepoint"}
          />
          <Spacer />
          <DropdownButton icon={Icons.Gear}>
            <button onClick={() => setScale(1)}>1x</button>
            <button onClick={() => setScale(2)}>2x</button>
            <button onClick={() => setScale(3)}>3x</button>
          </DropdownButton>
        </div>
        <ListView
          selected={selected}
          setSelected={(glyph) => {
            setSelected(glyph)
            state.setSelectionTarget(glyph)
          }}
          renderer={PixelGlyphRenderer}
          data={props.font.getPropValue("glyphs")}
          className={"foo"}
          direction={ListViewDirection.HorizontalWrap}
          options={opts}
        />
        {/*<PropSheet target={selected} collapsable={true} />*/}
        <PixelFontPreview font={props.font} />
      </div>
      <div className={"editor-view"}>{selected && <PixelGlyphEditor glyph={selected} />}</div>
    </>
  )
}
