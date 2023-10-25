import { Point, Size } from "josh_js_util"
import { canvas_to_blob, forceDownloadBlob } from "josh_web_util"
import React, { useEffect, useRef, useState } from "react"

import { DropdownButton } from "../common/common-components"
import { useWatchAllProps } from "../model/base"
import { PixelFont, PixelGlyph } from "../model/datamodel"
import { drawGlyph } from "./PixelFontEditorView"

export function measureTextRun(text: string, font: PixelFont) {
  const SPACE = 1
  let w = 0
  let h = 0
  const glyphs = font.getPropValue("glyphs")
  for (const ch of text) {
    const glyph = glyphs.find((g) => g.getPropValue("codepoint") === ch.codePointAt(0))
    if (glyph) {
      const left = glyph.getPropValue("left")
      const right = glyph.getPropValue("right")
      const size = glyph.getPropValue("size")
      w += size.w - left - right + SPACE
      h = Math.max(h, size.h)
    }
  }
  return new Size(w, h)
}

const EMPTY_GLYPH = new PixelGlyph({
  name: "EMPTY_GLYPH",
  codepoint: 256,
  size: new Size(10, 10),
  right: 0,
  left: 0,
  baseline: 10,
  descent: 0,
  ascent: 10,
})
EMPTY_GLYPH.getPropValue("data").fill(() => 0)
export function drawTextRun(
  ctx: CanvasRenderingContext2D,
  text: string,
  font: PixelFont,
  scale: number,
  black: string,
) {
  const glyphs = font.getPropValue("glyphs")
  let x = 0
  const SPACE = 1
  for (const ch of text) {
    let glyph = glyphs.find((g) => g.getPropValue("codepoint") === ch.codePointAt(0))
    if (glyph === undefined) glyph = EMPTY_GLYPH
    const left = glyph.getPropValue("left")
    const right = glyph.getPropValue("right")
    const size = glyph.getPropValue("size")
    drawGlyph(ctx, glyph, new Point(x - left, 0), black, scale)
    x += size.w - left - right + SPACE
  }
}

async function textToPng(text: string, font: PixelFont, scale: number) {
  const textSize = measureTextRun(text, font)
  const padding = 20
  const size = new Size(textSize.w + padding * 2, textSize.h + padding * 2)
  const canvas = document.createElement("canvas")
  canvas.width = size.w * scale
  canvas.height = size.h * scale
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D
  ctx.fillStyle = "white"
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.save()
  ctx.translate(padding * scale, padding * scale)
  drawTextRun(ctx, text, font, scale, "black")
  ctx.restore()

  const blob = await canvas_to_blob(canvas)
  forceDownloadBlob(`${font.getPropValue("name") as string}.${scale}x.png`, blob)
}

export function PixelFontPreview(props: { font: PixelFont }) {
  const [text, setText] = useState("ABC123abc")
  const ref = useRef<HTMLCanvasElement>(null)
  const scale = 3

  function redraw() {
    if (!ref.current) return
    const ctx = ref.current.getContext("2d") as CanvasRenderingContext2D
    ctx.imageSmoothingEnabled = false
    ctx.fillStyle = "red"
    ctx.fillRect(0, 0, ref.current.width, ref.current.height)
    const textSize = measureTextRun(text, props.font)
    const padding = 20
    ctx.save()
    ctx.translate(padding, padding)
    drawTextRun(ctx, text, props.font, scale, "black")
    ctx.restore()
    ctx.strokeStyle = "black"
    ctx.lineWidth = 1
    ctx.strokeRect(padding, padding, textSize.w * scale, 20 * scale)
  }

  useEffect(() => redraw(), [text, ref])
  useWatchAllProps(props.font, () => redraw())
  return (
    <div className={"hbox"}>
      <div className={"vbox"}>
        <input type={"text"} value={text} onChange={(e) => setText(e.target.value)} />
        <canvas ref={ref} width={250} height={100} />
      </div>
      <DropdownButton title={"export"}>
        <button onClick={() => textToPng(text, props.font, 1)}>export PNG 1x</button>
        <button onClick={() => textToPng(text, props.font, 2)}>export PNG 2x</button>
        <button onClick={() => textToPng(text, props.font, 4)}>export PNG 4x</button>
      </DropdownButton>
    </div>
  )
}
