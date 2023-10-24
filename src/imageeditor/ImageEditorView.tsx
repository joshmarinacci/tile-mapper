import "./SImageEditorView.css"

import { Bounds, Point } from "josh_js_util"
import { DialogContext } from "josh_react_util"
import { canvas_to_blob, forceDownloadBlob } from "josh_web_util"
import React, {
  MouseEvent,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react"

import { Icons, ImagePalette } from "../common/common"
import {
  DocContext,
  Icon,
  IconButton,
  Pane,
  ToggleButton,
} from "../common/common-components"
import { DividerColumnBox } from "../common/DividerColumnBox"
import {
  ListView,
  ListViewDirection,
  ListViewRenderer,
} from "../common/ListView"
import { PaletteColorPickerPane } from "../common/Palette"
import { PropSheet } from "../common/propsheet"
import { ShareImageDialog } from "../common/ShareImageDialog"
import {
  appendToList,
  PropsBase,
  useWatchAllProps,
  useWatchProp,
} from "../model/base"
import {
  ImageLayer,
  ImageObjectLayer,
  ImagePixelLayer,
  SImage,
} from "../model/datamodel"
import { GlobalState } from "../state"
import { strokeBounds } from "../util"
import { EllipseTool, EllipseToolSettings } from "./ellipse_tool"
import { EraserTool, EraserToolSettings } from "./eraser_tool"
import { FillTool, FillToolSettings } from "./fill_tool"
import { LineTool, LineToolSettings } from "./line_tool"
import { MoveTool, MoveToolSettings } from "./move_tool"
import { PencilTool, PencilToolSettings } from "./pencil_tool"
import { RectTool, RectToolSettings } from "./rect_tool"
import { SelectionTool, SelectionToolSettings } from "./selection_tool"
import { Tool } from "./tool"

const LayerItemRenderer: ListViewRenderer<
  PropsBase<ImageLayer>,
  never
> = (props: {
  value: PropsBase<ImageLayer>
  selected: boolean
  options: never
}) => {
  const { value } = props
  useWatchProp(value, "name")
  useWatchProp(value, "visible")
  useWatchProp(value, "opacity")
  return (
    <div
      className={"std-list-item"}
      style={{ justifyContent: "space-between" }}
    >
      {value instanceof ImagePixelLayer && <Icon name={Icons.PixelLayer} />}
      {value instanceof ImageObjectLayer && <Icon name={Icons.ObjectLayer} />}
      <b>{value.getPropValue("name")}</b>
      <i>{value.getPropValue("opacity").toFixed(2)}</i>
      <Icon
        onClick={() =>
          value.setPropValue("visible", !value.getPropValue("visible"))
        }
        name={value.getPropValue("visible") ? Icons.EyeOpen : Icons.EyeClosed}
      />
    </div>
  )
}

function clamp(val: number, min: number, max: number) {
  if (val < min) return min
  if (val > max) return max
  return val
}

export function drawImage(
  ctx: CanvasRenderingContext2D,
  image: SImage,
  palette: ImagePalette,
  scale: number,
) {
  image.getPropValue("layers").forEach((layer) => {
    if (!layer.getPropValue("visible")) return
    ctx.save()
    ctx.globalAlpha = clamp(layer.getPropValue("opacity"), 0, 1)
    layer.getPropValue("data").forEach((n, p) => {
      ctx.fillStyle = palette.colors[n]
      if (n === -1) ctx.fillStyle = "transparent"
      ctx.fillRect(p.x * scale, p.y * scale, 1 * scale, 1 * scale)
    })
    ctx.restore()
  })
}

function drawCanvas(
  canvas: HTMLCanvasElement,
  scale: number,
  grid: boolean,
  image: SImage,
  palette: ImagePalette,
  tool: Tool,
  drawColor: number,
  selectionRect: Bounds | undefined,
) {
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D
  ctx.fillStyle = "magenta"
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  drawImage(ctx, image, palette, scale)
  const size = image.getPropValue("size")
  if (grid) {
    ctx.strokeStyle = "black"
    ctx.lineWidth = 0.5
    ctx.beginPath()
    for (let i = 0; i < size.w; i++) {
      ctx.moveTo(i * scale, 0)
      ctx.lineTo(i * scale, size.h * scale)
    }
    for (let j = 0; j < size.h; j++) {
      ctx.moveTo(0, j * scale)
      ctx.lineTo(size.w * scale, j * scale)
    }
    ctx.stroke()
  }
  if (tool) {
    tool.drawOverlay({
      canvas: canvas,
      ctx: ctx,
      scale: scale,
      color: drawColor,
      palette: palette,
    })
  }

  if (selectionRect) {
    const bounds = selectionRect.scale(scale)
    ctx.setLineDash([5, 5])
    strokeBounds(ctx, bounds, "black", 1)
    ctx.setLineDash([])
  }
}

export function ImageEditorView(props: { image: SImage; state: GlobalState }) {
  const { image } = props
  const doc = useContext(DocContext)
  const palette = doc.getPropValue("palette")
  const [grid, setGrid] = useState(false)
  const [zoom, setZoom] = useState(3)
  const [drawColor, setDrawColor] = useState<string>(palette.colors[0])
  const [layer, setLayer] = useState<ImageLayer | undefined>(() => {
    if (image.getPropValue("layers").length > 0) {
      return image.getPropValue("layers")[0]
    } else {
      return undefined
    }
  })
  const canvasRef = useRef(null)
  const [pixelTool, setPixelTool] = useState<Tool>(() => new PencilTool())
  const [count, setCount] = useState(0)
  const size = image.getPropValue("size")
  const [columnWidth, setColumnWidth] = useState(300)
  const [selectionRect, setSelectionRect] = useState<Bounds | undefined>()

  const scale = Math.pow(2, zoom)
  const redraw = () => {
    if (canvasRef.current) {
      const scale = Math.pow(2, zoom)
      drawCanvas(
        canvasRef.current,
        scale,
        grid,
        image,
        palette,
        pixelTool,
        palette.colors.indexOf(drawColor),
        selectionRect,
      )
    }
  }
  const dm = useContext(DialogContext)

  useEffect(() => redraw(), [canvasRef, zoom, grid, count, image])
  useWatchAllProps(image, () => setCount(count + 1))

  const exportPNG = async () => {
    const scale = 4
    const canvas = document.createElement("canvas")
    const size = image.getPropValue("size").scale(scale)
    canvas.width = size.w
    canvas.height = size.h
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D
    drawImage(ctx, image, palette, scale)

    const blob = await canvas_to_blob(canvas)
    forceDownloadBlob(
      `${image.getPropValue("name") as string}.${scale}x.png`,
      blob,
    )
  }

  const sharePNG = async () => {
    const scale = 4
    const canvas = document.createElement("canvas")
    const size = image.getPropValue("size").scale(scale)
    canvas.width = size.w
    canvas.height = size.h
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D
    drawImage(ctx, image, palette, scale)

    const blob = await canvas_to_blob(canvas)
    dm.show(<ShareImageDialog blob={blob} />)
  }
  const crop = () => {
    if (selectionRect) {
      image.crop(selectionRect)
      setSelectionRect(undefined)
    }
  }
  const canvasToImage = (e: MouseEvent<HTMLCanvasElement>) => {
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect()
    return new Point(e.clientX, e.clientY)
      .subtract(new Point(rect.left, rect.top))
      .scale(1 / scale)
      .floor()
  }
  const new_pixel_layer = () => {
    const layer = new ImagePixelLayer({
      name: "new pixel layer",
      opacity: 1.0,
      visible: true,
    })
    layer.resizeAndClear(image.getPropValue("size"))
    appendToList(image, "layers", layer)
  }
  const new_object_layer = () => {
    const layer = new ImageObjectLayer({
      name: "new object layer",
      opacity: 1.0,
      visible: true,
    })
    appendToList(image, "layers", layer)
  }
  const del_layer = () => {
    if (!layer) return
    let layers = image.getPropValue("layers")
    layers = layers.slice()
    const n = layers.indexOf(layer)
    if (n >= 0) {
      layers.splice(n, 1)
    }
    image.setPropValue("layers", layers)
  }
  const move_layer_down = () => {
    if (!layer) return
    let layers = image.getPropValue("layers")
    layers = layers.slice()
    const n = layers.indexOf(layer)
    if (n >= layers.length) return
    layers.splice(n, 1)
    layers.splice(n + 1, 0, layer)
    image.setPropValue("layers", layers)
  }
  const move_layer_up = () => {
    if (!layer) return
    let layers = image.getPropValue("layers")
    layers = layers.slice()
    const n = layers.indexOf(layer)
    if (n <= 0) return
    layers.splice(n, 1)
    layers.splice(n - 1, 0, layer)
    image.setPropValue("layers", layers)
  }

  let tool_settings = <div>no tool selected</div>
  if (pixelTool instanceof PencilTool)
    tool_settings = <PencilToolSettings tool={pixelTool} />
  if (pixelTool instanceof EraserTool)
    tool_settings = <EraserToolSettings tool={pixelTool} />
  if (pixelTool instanceof RectTool)
    tool_settings = <RectToolSettings tool={pixelTool} />
  if (pixelTool instanceof LineTool)
    tool_settings = <LineToolSettings tool={pixelTool} />
  if (pixelTool instanceof EllipseTool)
    tool_settings = <EllipseToolSettings tool={pixelTool} />
  if (pixelTool instanceof FillTool)
    tool_settings = <FillToolSettings tool={pixelTool} />
  if (pixelTool instanceof SelectionTool)
    tool_settings = <SelectionToolSettings tool={pixelTool} />
  if (pixelTool instanceof MoveTool)
    tool_settings = <MoveToolSettings tool={pixelTool} />
  return (
    <div
      className={"image-editor-view"}
      style={{
        gridTemplateColumns: `${columnWidth}px 1fr`,
      }}
    >
      <DividerColumnBox value={columnWidth} onChange={setColumnWidth}>
        <Pane key={"layer-list"} title={"layers"} collapsable={true}>
          <div className={"toolbar"}>
            <IconButton
              onClick={() => new_pixel_layer()}
              icon={Icons.Plus}
              text={"pixels"}
            />
            <IconButton
              onClick={() => new_object_layer()}
              icon={Icons.Plus}
              text={"objects"}
            />
            <IconButton onClick={() => del_layer()} icon={Icons.Trashcan} />
            <IconButton
              onClick={() => move_layer_down()}
              icon={Icons.UpArrow}
            />
            <IconButton
              onClick={() => move_layer_up()}
              icon={Icons.DownArrow}
            />
          </div>
          <ListView
            className={"layers"}
            selected={layer}
            setSelected={setLayer}
            renderer={LayerItemRenderer}
            data={props.image.getPropValue("layers")}
            direction={ListViewDirection.VerticalFill}
            options={undefined as never}
          />
        </Pane>
        <PropSheet target={layer} title={"Layer Info"} collapsable={true} />
        <div className={"toolbar"}>
          <IconButton onClick={() => setZoom(zoom + 1)} icon={Icons.Plus} />
          <IconButton onClick={() => setZoom(zoom - 1)} icon={Icons.Minus} />
          <ToggleButton
            onClick={() => setGrid(!grid)}
            icon={Icons.Grid}
            selected={grid}
            selectedIcon={Icons.GridSelected}
          />
        </div>
        {layer instanceof ImagePixelLayer && (
          <div className={"toolbar"}>
            <ToggleButton
              icon={Icons.Selection}
              selectedIcon={Icons.SelectionSelected}
              selected={pixelTool.name === "selection"}
              onClick={() => setPixelTool(new SelectionTool())}
            />
            <ToggleButton
              icon={Icons.Move}
              selected={pixelTool.name === "move"}
              onClick={() => setPixelTool(new MoveTool())}
            />
            <ToggleButton
              icon={Icons.Pencil}
              selected={pixelTool.name === "pencil"}
              onClick={() => setPixelTool(new PencilTool())}
            />
            <ToggleButton
              icon={Icons.Eraser}
              selected={pixelTool.name === "eraser"}
              onClick={() => setPixelTool(new EraserTool())}
            />
            <ToggleButton
              onClick={() => setPixelTool(new LineTool())}
              icon={Icons.Line}
              selected={pixelTool.name === "line"}
            />
            <ToggleButton
              onClick={() => setPixelTool(new RectTool())}
              icon={Icons.Rect}
              selectedIcon={Icons.RectSelected}
              selected={pixelTool.name === "rect"}
            />
            <ToggleButton
              onClick={() => setPixelTool(new EllipseTool())}
              icon={Icons.Ellipse}
              selected={pixelTool.name === "ellipse"}
            />
            <ToggleButton
              onClick={() => setPixelTool(new FillTool())}
              icon={Icons.PaintBucket}
              selected={pixelTool.name === "fill"}
            />
            <button onClick={() => crop()}>crop</button>
          </div>
        )}
        {layer instanceof ImageObjectLayer && (
          <div className={"toolbar"}>
            <ToggleButton
              onClick={() => {}}
              icon={Icons.Plus}
              selected={false}
              text={"new text"}
            />
            <ToggleButton
              icon={Icons.Move}
              selected={pixelTool.name === "move"}
              text={"move"}
              onClick={() => 0}
            />
            <ToggleButton
              icon={Icons.Move}
              selected={pixelTool.name === "move"}
              text={"delete object"}
              onClick={() => 0}
            />
          </div>
        )}
        <div className={"toolbar"}>
          <b>{pixelTool.name} settings</b>
          {tool_settings}
        </div>
        <PaletteColorPickerPane
          drawColor={drawColor}
          setDrawColor={setDrawColor}
          palette={palette}
        />
        <div className={"toolbar"}>
          <button onClick={exportPNG}>export PNG</button>
          <button onClick={sharePNG}>share PNG</button>
        </div>
      </DividerColumnBox>
      <div className={"image-editor-canvas-wrapper"}>
        <canvas
          ref={canvasRef}
          width={size.w * scale}
          height={size.h * scale}
          onContextMenu={(e) => {
            e.preventDefault()
            e.stopPropagation()
            const pt = canvasToImage(e)
            if (layer) {
              const color = layer.getPixel(pt)
              setDrawColor(palette.colors[color])
            }
          }}
          onMouseDown={(e) => {
            if (e.button == 2) return
            pixelTool.onMouseDown({
              color: palette.colors.indexOf(drawColor),
              pt: canvasToImage(e),
              e: e,
              layer: layer,
              palette: palette,
              selection: selectionRect,
              setSelectionRect: (rect) => setSelectionRect(rect),
              markDirty: () => {
                setCount(count + 1)
              },
            })
          }}
          onMouseMove={(e) => {
            pixelTool.onMouseMove({
              color: palette.colors.indexOf(drawColor),
              pt: canvasToImage(e),
              e: e,
              layer: layer,
              palette: palette,
              selection: selectionRect,
              setSelectionRect: (rect) => setSelectionRect(rect),
              markDirty: () => {
                setCount(count + 1)
              },
            })
          }}
          onMouseUp={(e) => {
            pixelTool.onMouseUp({
              color: palette.colors.indexOf(drawColor),
              pt: canvasToImage(e),
              e: e,
              layer: layer,
              palette: palette,
              selection: selectionRect,
              setSelectionRect: (rect) => setSelectionRect(rect),
              markDirty: () => {
                setCount(count + 1)
              },
            })
          }}
        />
      </div>
    </div>
  )
}
