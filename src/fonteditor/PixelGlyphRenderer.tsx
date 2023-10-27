import { Point } from "josh_js_util"
import React, { useEffect, useRef } from "react"

import { ListViewRenderer } from "../common/ListView"
import { ICON_CACHE } from "../iconcache"
import { useWatchAllProps } from "../model/base"
import { PixelGlyph } from "../model/datamodel"
import { drawGlyph } from "./PixelFontEditorView"

export type GlyphDrawOptions = {
  drawNames: boolean
  scale: number
}
export const PixelGlyphRenderer: ListViewRenderer<PixelGlyph, GlyphDrawOptions> = (props: {
  value: PixelGlyph | undefined
  selected: boolean
  options: GlyphDrawOptions
}) => {
  const { value } = props
  if (!value) {
    return <div>missing</div>
  }
  const ref = useRef<HTMLCanvasElement>(null)
  const size = value.getPropValue("size")
  const scale = props.options.scale
  const redraw = () => {
    if (ref.current && value) {
      const canvas = ref.current
      const ctx = canvas.getContext("2d") as CanvasRenderingContext2D
      ctx.imageSmoothingEnabled = false
      ctx.fillStyle = ctx.createPattern(
        ICON_CACHE.getIconCanvas("checkerboard"),
        "repeat",
      ) as CanvasPattern
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      drawGlyph(ctx, value, new Point(0, 0), "black", 1)
    }
  }

  useEffect(() => redraw(), [value])
  // useWatchProp(value, "data", () => redraw())
  useWatchAllProps(value, () => redraw())
  return (
    <div
      style={{
        position: "relative",
        imageRendering: "pixelated",
      }}
    >
      {props.options.drawNames && (
        <span
          style={{
            position: "absolute",
            top: "5px",
            left: "5px",
          }}
        >
          {value.getPropValue("name")}
        </span>
      )}
      <canvas
        ref={ref}
        // className={toClass({ "tile-preview": true, selected })}
        style={{
          width: `${size.w * scale}px`,
          height: `${size.h * scale}px`,
          border: props.selected ? "3px solid black" : "3px solid transparent",
        }}
        width={size.w}
        height={size.h}
      ></canvas>
    </div>
  )
}
