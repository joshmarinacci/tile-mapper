import "./SImageEditorView.css"

import { Bounds, Point } from "josh_js_util"
import { DialogContext, Spacer } from "josh_react_util"
import { canvas_to_blob } from "josh_web_util"
import React, { MouseEvent, useContext, useEffect, useRef, useState } from "react"

import {
  AddNewImageLayerAction,
  ExportImageToGIFAction,
  ExportImageToPNGAction,
  MoveImageLayerDownAction,
  MoveImageLayerUpAction,
} from "../actions/image"
import { ImagePalette } from "../common/common"
import {
  DropdownButton,
  IconButton,
  Pane,
  ToggleButton,
  ToolbarActionButton,
} from "../common/common-components"
import { Icons } from "../common/icons"
import { ListView, ListViewDirection } from "../common/ListView"
import { PaletteColorPickerPane } from "../common/Palette"
import { ShareImageDialog } from "../common/ShareImageDialog"
import { useWatchAllProps, useWatchProp } from "../model/base"
import { DocContext, StateContext } from "../model/contexts"
import { GameDoc } from "../model/gamedoc"
import { FramePixelSurface, ImageFrame, ImageLayer, SImage } from "../model/image"
import { strokeBounds, wrapNumber } from "../util"
import { EllipseTool, EllipseToolSettings } from "./ellipse_tool"
import { EraserTool, EraserToolSettings } from "./eraser_tool"
import { FillTool, FillToolSettings } from "./fill_tool"
import { FrameItemRenderer } from "./FrameItemRenderer"
import { LayerItemRenderer } from "./LayerItemRenderer"
import { LineTool, LineToolSettings } from "./line_tool"
import { MoveTool, MoveToolSettings } from "./move_tool"
import { PencilTool, PencilToolSettings } from "./pencil_tool"
import { RectTool, RectToolSettings } from "./rect_tool"
import { ResizeImageDialog } from "./ResizeImageDialog"
import { SelectionTool, SelectionToolSettings } from "./selection_tool"
import { ShiftTool, ShiftToolSettings } from "./shift_tool"
import { PixelTool } from "./tool"

function clamp(val: number, min: number, max: number) {
  if (val < min) return min
  if (val > max) return max
  return val
}

function drawPixelLayer(
  ctx: CanvasRenderingContext2D,
  layer: ImageLayer,
  surf: FramePixelSurface,
  palette: ImagePalette,
  scale: number,
) {
  ctx.save()
  ctx.globalAlpha = clamp(layer.opacity(), 0, 1)
  surf.forEach((n: number, p: Point) => {
    ctx.fillStyle = palette.colors[n]
    if (n === -1) ctx.fillStyle = "transparent"
    ctx.fillRect(p.x * scale, p.y * scale, 1 * scale, 1 * scale)
  })
  ctx.restore()
}

export function drawImage(
  doc: GameDoc,
  ctx: CanvasRenderingContext2D,
  image: SImage,
  palette: ImagePalette,
  scale: number,
  frame: ImageFrame,
) {
  image.layers().forEach((layer) => {
    if (!layer.visible()) return
    const surf = image.getPixelSurface(layer, frame)
    drawPixelLayer(ctx, layer, surf, palette, scale)
  })
}

function drawCanvas(
  doc: GameDoc,
  canvas: HTMLCanvasElement,
  scale: number,
  grid: boolean,
  image: SImage,
  palette: ImagePalette,
  tool: PixelTool,
  drawColor: number,
  selectionRect: Bounds | undefined,
  frame: ImageFrame,
) {
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D
  ctx.fillStyle = "magenta"
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  drawImage(doc, ctx, image, palette, scale, frame)
  const size = image.size()
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

export function ImageEditorView(props: { image: SImage }) {
  const { image } = props
  if (image.frames().length < 1) {
    image.appendFrame(new ImageFrame())
  }
  useWatchProp(image, "history", () => {
    console.log("history changed")
  })
  const doc = useContext(DocContext)
  const state = useContext(StateContext)
  const palette = doc.palette()
  const [lastPoint, setLastPoint] = useState(new Point(0, 0))
  const [grid, setGrid] = useState(false)
  const [zoom, setZoom] = useState(3)
  const [drawColor, setDrawColor] = useState<string>(palette.colors[0])
  const [layer, setLayer] = useState<ImageLayer | undefined>(() => image.layers()[0])
  const canvasRef = useRef(null)
  const [pixelTool, setPixelTool] = useState<PixelTool>(() => new PencilTool())
  const [count, setCount] = useState(0)
  const [selectionRect, setSelectionRect] = useState<Bounds | undefined>()
  const [frame, setFrame] = useState<ImageFrame | undefined>(() => image.frames()[0])

  const navPrevFrame = () => {
    if (frame) {
      let index = image.frames().findIndex((f) => f === frame)
      index = wrapNumber(index - 1, 0, image.frames().length)
      setFrame(image.frames()[index])
    }
  }
  const navNextFrame = () => {
    if (frame) {
      let index = image.frames().findIndex((f) => f === frame)
      index = wrapNumber(index + 1, 0, image.frames().length)
      setFrame(image.frames()[index])
    }
  }
  const addEmptyFrame = () => {
    image.addEmptyFrame()
  }
  const addCopyFrame = () => {
    if (frame) {
      image.cloneAndAddFrame(frame)
    }
  }

  const scale = Math.pow(2, zoom)
  const redraw = () => {
    if (canvasRef.current && frame) {
      const scale = Math.pow(2, zoom)
      drawCanvas(
        doc,
        canvasRef.current,
        scale,
        grid,
        image,
        palette,
        pixelTool,
        palette.colors.indexOf(drawColor),
        selectionRect,
        frame,
      )
    }
  }
  const dm = useContext(DialogContext)

  useEffect(() => redraw(), [canvasRef, zoom, grid, count, image, frame])
  useWatchAllProps(image, () => setCount(count + 1))

  const sharePNG = async () => {
    const scale = 4
    const canvas = document.createElement("canvas")
    const size = image.size().scale(scale)
    canvas.width = size.w
    canvas.height = size.h
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D
    const frame = image.frames()[0]
    drawImage(doc, ctx, image, palette, scale, frame)

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

  const resize_image = () => {
    dm.show(<ResizeImageDialog image={image} />)
  }
  let tool_settings = <div>no tool selected</div>
  if (pixelTool instanceof PencilTool) tool_settings = <PencilToolSettings tool={pixelTool} />
  if (pixelTool instanceof EraserTool) tool_settings = <EraserToolSettings tool={pixelTool} />
  if (pixelTool instanceof RectTool) tool_settings = <RectToolSettings tool={pixelTool} />
  if (pixelTool instanceof LineTool) tool_settings = <LineToolSettings tool={pixelTool} />
  if (pixelTool instanceof EllipseTool) tool_settings = <EllipseToolSettings tool={pixelTool} />
  if (pixelTool instanceof FillTool) tool_settings = <FillToolSettings tool={pixelTool} />
  if (pixelTool instanceof SelectionTool) tool_settings = <SelectionToolSettings tool={pixelTool} />
  if (pixelTool instanceof MoveTool) tool_settings = <MoveToolSettings tool={pixelTool} />
  if (pixelTool instanceof ShiftTool) tool_settings = <ShiftToolSettings tool={pixelTool} />

  const handle_key_down = (e: React.KeyboardEvent) => {
    // console.log(e.key, e.code, e.shiftKey)
    if (e.code === "KeyZ" && !e.shiftKey) {
      state.getPropValue("toaster").fireMessage("undo")
      image.undo()
    }
    if (e.code === "KeyZ" && e.shiftKey) {
      state.getPropValue("toaster").fireMessage("redo")
      image.redo()
    }
    if (layer && frame) {
      pixelTool.onKeyDown({
        image: image,
        surface: image.getPixelSurface(layer, frame),
        color: palette.colors.indexOf(drawColor),
        e: e,
        layer: layer,
        palette: palette,
        selection: selectionRect,
        setSelectionRect: (rect) => setSelectionRect(rect),
        markDirty: () => {
          setCount(count + 1)
        },
      })
    }
    if (e.key === "a") navPrevFrame()
    if (e.key === "s") navNextFrame()
    if (e.key === "=") setZoom(zoom + 1)
    if (e.key === "-") setZoom(zoom - 1)
    if (e.key === "v") {
      state.getPropValue("toaster").fireMessage("select move tool")
      setPixelTool(new ShiftTool())
    }
    if (e.key === "p") setPixelTool(new PencilTool())
    if (e.key === "b") setPixelTool(new FillTool())
    if (e.key === "e") setPixelTool(new EraserTool())
    if (e.key === "u") setPixelTool(new RectTool())
    if (e.key === "x") {
      if (layer && frame) {
        const color = image.getPixelSurface(layer, frame).getPixel(lastPoint)
        setDrawColor(palette.colors[color])
      }
    }
  }

  return (
    <>
      <div className={"tool-column"} onKeyDown={handle_key_down}>
        <Pane key={"layer-list"} title={"layers"} collapsable={true}>
          <div className={"toolbar"}>
            <ToolbarActionButton action={AddNewImageLayerAction} />
            <Spacer />
            <DropdownButton icon={Icons.Gear}>
              <ToolbarActionButton action={MoveImageLayerUpAction} />
              <ToolbarActionButton action={MoveImageLayerDownAction} />
              <IconButton
                onClick={() => resize_image()}
                icon={Icons.Resize}
                tooltip={"resize layer"}
                text={"resize layer"}
              />
              <ToolbarActionButton action={ExportImageToPNGAction} />
              <IconButton icon={Icons.Share} onClick={sharePNG} text={"share png"} />
              <ToolbarActionButton action={ExportImageToGIFAction} />
            </DropdownButton>
          </div>
          <ListView
            className={"layers"}
            selected={layer}
            setSelected={(layer) => {
              setLayer(layer)
              state.setSelectionTarget(layer)
            }}
            renderer={LayerItemRenderer}
            data={image.layers()}
            direction={ListViewDirection.VerticalFill}
            options={undefined as never}
          />
        </Pane>
        <Pane key={"frame-list"} title={"frames"} collapsable={true}>
          <ListView
            className={"frames"}
            selected={frame}
            setSelected={(frame) => {
              setFrame(frame)
              state.setSelectionTarget(frame)
            }}
            renderer={FrameItemRenderer}
            data={image.frames()}
            direction={ListViewDirection.HorizontalWrap}
            options={{
              image: image,
              palette: palette,
              doc: doc,
            }}
          />
        </Pane>
      </div>
      <div className={"editor-view"} onKeyDown={handle_key_down}>
        <div className={"toolbar"}>
          <IconButton onClick={() => setZoom(zoom + 1)} icon={Icons.Plus} />
          <IconButton onClick={() => setZoom(zoom - 1)} icon={Icons.Minus} />
          <ToggleButton
            onClick={() => setGrid(!grid)}
            icon={Icons.Grid}
            selected={grid}
            selectedIcon={Icons.GridSelected}
          />
          <Spacer />
          <IconButton onClick={() => image.undo()} icon={Icons.Undo} tooltip={"undo"} />
          <label>history</label>
          <IconButton onClick={() => image.redo()} icon={Icons.Redo} tooltip={"redo"} />
          <Spacer />
          <label>Frame</label>
          <IconButton onClick={addEmptyFrame} icon={Icons.Plus} tooltip={"add empty frame"} />
          <IconButton onClick={addCopyFrame} icon={Icons.Duplicate} tooltip={"add copy frame"} />
        </div>
        <div className={"toolbar"}>
          {layer instanceof ImageLayer && (
            <div className={"toolbar"}>
              <ToggleButton
                icon={Icons.Selection}
                selectedIcon={Icons.SelectionSelected}
                selected={pixelTool.name === "selection"}
                onClick={() => setPixelTool(new SelectionTool())}
              />
              <ToggleButton
                icon={Icons.Move}
                selected={pixelTool.name === "shift"}
                onClick={() => setPixelTool(new ShiftTool())}
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
          <div className={"toolbar"}>
            <b>{pixelTool.name} settings</b>
            {tool_settings}
          </div>
        </div>
        <PaletteColorPickerPane
          drawColor={drawColor}
          setDrawColor={setDrawColor}
          palette={palette}
        />
        <div>
          <canvas
            tabIndex={0}
            ref={canvasRef}
            width={image.size().scale(scale).w}
            height={image.size().scale(scale).h}
            onContextMenu={(e) => {
              e.preventDefault()
              e.stopPropagation()
              const pt = canvasToImage(e)
              if (layer && frame) {
                const color = image.getPixelSurface(layer, frame).getPixel(pt)
                setDrawColor(palette.colors[color])
              }
            }}
            onMouseDown={(e) => {
              setLastPoint(canvasToImage(e))
              if (e.button == 2) return
              if (layer && frame) {
                pixelTool.onMouseDown({
                  image: image,
                  surface: image.getPixelSurface(layer, frame),
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
              }
            }}
            onMouseMove={(e) => {
              setLastPoint(canvasToImage(e))
              if (layer && frame) {
                pixelTool.onMouseMove({
                  image: image,
                  surface: image.getPixelSurface(layer, frame),
                  color: palette.colors.indexOf(drawColor),
                  pt: canvasToImage(e),
                  e: e,
                  layer: layer,
                  palette: palette,
                  selection: selectionRect,
                  setSelectionRect: (rect) => setSelectionRect(rect),
                  markDirty: () => setCount(count + 1),
                })
              }
            }}
            onMouseUp={(e) => {
              setLastPoint(canvasToImage(e))
              if (layer && frame) {
                pixelTool.onMouseUp({
                  image: image,
                  surface: image.getPixelSurface(layer, frame),
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
              }
            }}
          />
        </div>
        {/*<DraggablePaletteWindow title={"preview"}>*/}
        {/*  <AnimatedImagePreview image={image} count={count} />*/}
        {/*</DraggablePaletteWindow>*/}
        {/*<DraggablePaletteWindow title={"history"}>*/}
        {/*  <ImageHistoryView image={image} />*/}
        {/*</DraggablePaletteWindow>*/}
      </div>
    </>
  )
}
