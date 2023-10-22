import { Point } from "josh_js_util"
import React, { useEffect, useRef, useState } from "react"

import { useWatchAllProps } from "../model/base"
import { PixelFont } from "../model/datamodel"
import { drawGlyph } from "./PixelFontEditorView"

export function PixelFontPreview(props: { font: PixelFont }) {
  const [text, setText] = useState("ABC123abc")
  const ref = useRef<HTMLCanvasElement>(null)
  const SPACE = 2

  function redraw() {
    if (!ref.current) return
    const ctx = ref.current.getContext("2d") as CanvasRenderingContext2D
    ctx.imageSmoothingEnabled = false
    ctx.fillStyle = "red"
    ctx.fillRect(0, 0, ref.current.width, ref.current.height)

    let x = 0
    const y = 2
    for (const ch of text) {
      const glyphs = props.font.getPropValue("glyphs")
      const glyph = glyphs.find(
        (g) => g.getPropValue("codepoint") === ch.codePointAt(0),
      )
      if (glyph) {
        drawGlyph(ctx, glyph, new Point(x, y), "black", 2)
        x +=
          glyph.getPropValue("size").w -
          glyph.getPropValue("left") -
          glyph.getPropValue("right") +
          SPACE
      } else {
        ctx.fillStyle = "black"
        ctx.fillText(ch, x, y)
        x += 10
      }
    }
  }

  useEffect(() => redraw(), [text, ref])
  useWatchAllProps(props.font, () => redraw())
  return (
    <div className={"vbox"}>
      <input
        type={"text"}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <canvas ref={ref} width={300} height={50} />
    </div>
  )
}
