import { Point } from "josh_js_util"
import { HBox } from "josh_react_util"
import React, {
  MouseEvent,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react"

import { drawGrid } from "./actions/actions"
import { Icons, ImagePalette } from "./common/common"
import {
  DocContext,
  IconButton,
  ToggleButton,
} from "./common/common-components"
import {
  ListView,
  ListViewDirection,
  ListViewRenderer,
} from "./common/ListView"
import { PropSheet } from "./common/propsheet"
import { ICON_CACHE } from "./iconcache"
import { appendToList, useWatchAllProps, useWatchProp } from "./model/base"
import { PixelFont, PixelGlyph } from "./model/datamodel"
import { GlobalState } from "./state"

function drawGlyph(
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

function PixelGlyphEditor(props: { glyph: PixelGlyph; palette: ImagePalette }) {
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
          glyph.getPropValue("data").set(canvasToImage(e), color)
          glyph._fire("data", glyph.getPropValue("data"))
        }}
        onMouseMove={(e) => {
          if (down) {
            glyph.getPropValue("data").set(canvasToImage(e), color)
            glyph._fire("data", glyph.getPropValue("data"))
          }
        }}
        onMouseUp={() => setDown(false)}
      ></canvas>
    </div>
  )
}

type GlyphDrawOptions = {
  drawNames: boolean
}
const PixelGlyphRenderer: ListViewRenderer<
  PixelGlyph,
  GlyphDrawOptions
> = (props: {
  value: PixelGlyph
  selected: boolean
  options: GlyphDrawOptions
}) => {
  const { value } = props
  const ref = useRef<HTMLCanvasElement>(null)
  const size = value.getPropValue("size")
  const scale = 2
  const redraw = () => {
    if (ref.current && value) {
      const canvas = ref.current
      const ctx = canvas.getContext("2d") as CanvasRenderingContext2D
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
          {props.value.getPropValue("name")}
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

function PixelFontPreview(props: { font: PixelFont }) {
  const [text, setText] = useState("preview text")
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    if (!ref.current) return
    const ctx = ref.current.getContext("2d") as CanvasRenderingContext2D
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
          glyph.getPropValue("right")
      } else {
        ctx.fillStyle = "black"
        ctx.fillText(ch, x, y)
        x += 10
      }
    }
  }, [text, ref])
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
    const glyph = new PixelGlyph({ name: "letter" })
    appendToList(props.font, "glyphs", glyph)
  }
  const toggle_draw_names = () => {
    setDrawNames(!drawNames)
  }
  useWatchProp(props.font, "glyphs")
  const opts: GlyphDrawOptions = {
    drawNames: drawNames,
  }
  return (
    <div className={"hbox"}>
      <div className={"vbox"}>
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
