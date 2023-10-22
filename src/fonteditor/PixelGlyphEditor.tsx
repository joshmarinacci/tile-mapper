import { Point } from "josh_js_util"
import { HBox } from "josh_react_util"
import React, {
  MouseEvent,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react"

import { drawGrid } from "../actions/actions"
import { Icons, ImagePalette } from "../common/common"
import {
  DocContext,
  IconButton,
  ToggleButton,
} from "../common/common-components"
import { ICON_CACHE } from "../iconcache"
import { useWatchAllProps, useWatchProp } from "../model/base"
import { PixelGlyph } from "../model/datamodel"
import { drawGlyph } from "./PixelFontEditorView"

export function PixelGlyphEditor(props: {
  glyph: PixelGlyph
  palette: ImagePalette
}) {
  const doc = useContext(DocContext)
  const { palette, glyph } = props
  const [down, setDown] = useState<boolean>(false)
  const [grid, setGrid] = useState<boolean>(false)
  const [fillOnce, setFillOnce] = useState<boolean>(false)
  const [zoom, setZoom] = useState<number>(5)
  const [color, setColor] = useState(0)
  const dpi = window.devicePixelRatio
  const scale = Math.pow(2, zoom)
  const ref = useRef<HTMLCanvasElement>(null)
  const redraw = () => {
    if (!ref.current) return
    const canvas = ref.current
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D
    ctx.imageSmoothingEnabled = false
    ctx.fillStyle = "magenta"
    ctx.fillStyle = ctx.createPattern(
      ICON_CACHE.getIconCanvas("checkerboard"),
      "repeat",
    ) as CanvasPattern
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    const sc = scale * dpi
    const size = glyph.getPropValue("size")
    drawGlyph(ctx, glyph, new Point(0, 0), "black", sc)
    drawGrid(canvas, (scale / size.w) * dpi, size, size)

    ctx.fillStyle = "cyan"
    const baseline = glyph.getPropValue("baseline")
    ctx.fillRect(0, baseline * sc, canvas.width, 3)
    const ascent = glyph.getPropValue("ascent")
    ctx.fillStyle = "green"
    ctx.fillRect(0, (baseline - ascent) * sc, canvas.width, 3)
    const descent = glyph.getPropValue("descent")
    ctx.fillStyle = "green"
    ctx.fillRect(0, (baseline + descent) * sc, canvas.width, 3)

    ctx.fillStyle = "red"
    const left = glyph.getPropValue("left")
    ctx.fillRect(left * sc - 1, 0, 3, canvas.height)
    const right = glyph.getPropValue("right")
    ctx.fillRect(canvas.width - right * sc - 1, 0, 3, canvas.height)
  }
  useEffect(() => redraw(), [down, grid, zoom, glyph])
  useWatchProp(glyph, "data", () => redraw())
  useWatchAllProps(glyph, () => redraw())

  const canvasToImage = (e: MouseEvent<HTMLCanvasElement>) => {
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect()
    return new Point(e.clientX, e.clientY)
      .subtract(new Point(rect.left, rect.top))
      .scale(1 / scale)
      .floor()
  }

  const canSize = glyph.getPropValue("size").scale(scale)

  return (
    <div
      className={"pane"}
      style={{
        overflow: "scroll",
        maxWidth: "unset",
      }}
    >
      <header>Edit</header>
      <HBox className={"hbox toolbar"}>
        <ToggleButton
          onClick={() => setGrid(!grid)}
          icon={Icons.Grid}
          selected={grid}
          selectedIcon={Icons.GridSelected}
        />
        <ToggleButton
          onClick={() => setFillOnce(true)}
          icon={Icons.PaintBucket}
          selected={fillOnce}
        />
        <IconButton onClick={() => setZoom(zoom + 1)} icon={Icons.Plus} />
        <label>{zoom}</label>
        <IconButton onClick={() => setZoom(zoom - 1)} icon={Icons.Minus} />
        <ToggleButton
          onClick={() => setColor(0)}
          icon={Icons.Pencil}
          selected={color === 0}
        />
        <ToggleButton
          onClick={() => setColor(-1)}
          icon={Icons.Eraser}
          selected={color === -1}
        />
      </HBox>
      <canvas
        ref={ref}
        style={{
          border: "1px solid black",
          width: `${canSize.w}px`,
          height: `${canSize.h}px`,
        }}
        width={canSize.w * dpi}
        height={canSize.h * dpi}
        onContextMenu={(e) => {
          e.preventDefault()
        }}
        onMouseDown={(e) => {
          setDown(true)
          if (e.button === 2) {
            const color = glyph.getPropValue("data").get(canvasToImage(e))
            setColor(color)
            e.stopPropagation()
            e.preventDefault()
            return
          }
          glyph.getPropValue("data").set(canvasToImage(e), color)
          glyph._fire("data", glyph.getPropValue("data"))
          glyph._fireAll()
        }}
        onMouseMove={(e) => {
          if (down) {
            glyph.getPropValue("data").set(canvasToImage(e), color)
            glyph._fire("data", glyph.getPropValue("data"))
            glyph._fireAll()
          }
        }}
        onMouseUp={() => setDown(false)}
      ></canvas>
    </div>
  )
}
