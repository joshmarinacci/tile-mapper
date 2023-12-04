import "./SImageEditorView.css"

import { Bounds, Point } from "josh_js_util"
import { DialogContext, Spacer } from "josh_react_util"
import { canvas_to_blob } from "josh_web_util"
import React, { MouseEvent, useContext, useEffect, useRef, useState } from "react"

import {
  AddNewImageObjectLayerAction,
  AddNewImagePixelLayerAction,
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
import { drawTextRun } from "../fonteditor/PixelFontPreview"
import {
  appendToList,
  PropsBase,
  removeFromList,
  useWatchAllProps,
  useWatchProp,
} from "../model/base"
import { DocContext, StateContext } from "../model/contexts"
import { GameDoc } from "../model/gamedoc"
import {
  FramePixelSurface,
  ImageLayerType,
  ImageObjectLayer,
  ImagePixelLayer,
  SImage,
  TextObject,
} from "../model/image"
import { strokeBounds } from "../util"
import { EllipseTool, EllipseToolSettings } from "./ellipse_tool"
import { EraserTool, EraserToolSettings } from "./eraser_tool"
import { FillTool, FillToolSettings } from "./fill_tool"
import { LayerItemRenderer } from "./LayerItemRenderer"
import { LineTool, LineToolSettings } from "./line_tool"
import { MoveTool, MoveToolSettings } from "./move_tool"
import { MoveObjectTool } from "./MoveObjectTool"
import { PencilTool, PencilToolSettings } from "./pencil_tool"
import { RectTool, RectToolSettings } from "./rect_tool"
import { ResizeImageDialog } from "./ResizeImageDialog"
import { SelectionTool, SelectionToolSettings } from "./selection_tool"
import { ObjectTool, PixelTool } from "./tool"

function clamp(val: number, min: number, max: number) {
  if (val < min) return min
  if (val > max) return max
  return val
}

function drawPixelLayer(
  ctx: CanvasRenderingContext2D,
  layer: ImagePixelLayer,
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
  currentFrame: number,
) {
  image.layers().forEach((layer) => {
    if (layer instanceof ImagePixelLayer) {
      if (!layer.visible()) return
      const surf = image.getFramePixelSurface(layer, currentFrame)
      drawPixelLayer(ctx, layer, surf, palette, scale)
    }
    if (layer instanceof ImageObjectLayer) {
      if (!layer.visible()) return
      ctx.save()
      ctx.globalAlpha = clamp(layer.opacity(), 0, 1)
      layer.getPropValue("data").forEach((obj) => {
        if (obj instanceof TextObject) {
          const pt = obj.getPropValue("position")
          const font_ref = obj.getPropValue("font")
          const txt = obj.getPropValue("text")
          const color = obj.getPropValue("color")
          if (font_ref) {
            const font = doc.fonts().find((fnt) => fnt.getUUID() === font_ref)
            if (font) {
              ctx.save()
              ctx.translate(pt.x * scale, pt.y * scale)
              drawTextRun(ctx, txt, font, scale, color)
              ctx.restore()
            }
          } else {
            ctx.font = "12pt sans-serif"
            ctx.fillStyle = color
            ctx.fillText(txt, pt.x, pt.y + 20)
          }
        }
      })
      ctx.restore()
    }
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
  tool2: ObjectTool,
  drawColor: number,
  selectionRect: Bounds | undefined,
  selectedObject: TextObject | undefined,
  currentFrame: number,
) {
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D
  ctx.fillStyle = "magenta"
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  drawImage(doc, ctx, image, palette, scale, currentFrame)
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
  if (tool2) {
    tool2.drawOverlay({
      canvas: canvas,
      ctx: ctx,
      scale: scale,
      selectedObject: selectedObject,
      doc: doc,
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
  useWatchProp(image, "history", () => {
    console.log("history changed")
  })
  const doc = useContext(DocContext)
  const state = useContext(StateContext)
  const palette = doc.palette()
  const [grid, setGrid] = useState(false)
  const [zoom, setZoom] = useState(3)
  const [drawColor, setDrawColor] = useState<string>(palette.colors[0])
  const [layer, setLayer] = useState<PropsBase<ImageLayerType> | undefined>(() => {
    if (image.layers().length > 0) {
      return image.layers()[0]
    } else {
      return undefined
    }
  })
  const canvasRef = useRef(null)
  const [pixelTool, setPixelTool] = useState<PixelTool>(() => new PencilTool())
  const [objectTool] = useState<ObjectTool>(() => new MoveObjectTool())
  const [count, setCount] = useState(0)
  const [selectionRect, setSelectionRect] = useState<Bounds | undefined>()
  const [selectedObject, setSelectedObject] = useState<TextObject | undefined>()
  const [currentFrame, setCurrentFrame] = useState(0)
  const navPrevFrame = () => {
    const fc = image.getPropValue("frameCount")
    let cf = currentFrame - 1
    if (cf < 0) cf = fc - 1
    setCurrentFrame(cf)
  }
  const navNextFrame = () => {
    const fc = image.getPropValue("frameCount")
    setCurrentFrame((currentFrame + 1) % fc)
  }
  const addCopyFrame = () => {
    image.cloneAndAddFrame(currentFrame)
  }

  const scale = Math.pow(2, zoom)
  const redraw = () => {
    if (canvasRef.current) {
      const scale = Math.pow(2, zoom)
      drawCanvas(
        doc,
        canvasRef.current,
        scale,
        grid,
        image,
        palette,
        pixelTool,
        objectTool,
        palette.colors.indexOf(drawColor),
        selectionRect,
        selectedObject,
        currentFrame,
      )
    }
  }
  const dm = useContext(DialogContext)

  useEffect(() => redraw(), [canvasRef, zoom, grid, count, image, currentFrame])
  useWatchAllProps(image, () => setCount(count + 1))

  const sharePNG = async () => {
    const scale = 4
    const canvas = document.createElement("canvas")
    const size = image.size().scale(scale)
    canvas.width = size.w
    canvas.height = size.h
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D
    drawImage(doc, ctx, image, palette, scale, 0)

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

  function deleteSelectedObject() {
    if (layer instanceof ImageObjectLayer && selectedObject !== undefined) {
      removeFromList(layer, "data", selectedObject)
      setSelectedObject(undefined)
    }
  }

  const add_text_object = () => {
    if (layer instanceof ImageObjectLayer) {
      const font = doc.fonts().find((fnt) => fnt)
      const textobj = new TextObject({
        name: "new text",
        text: "ABC",
        position: new Point(10, 10),
        font: font?.getUUID(),
      })
      appendToList(layer, "data", textobj)
      setSelectedObject(textobj)
      state.setSelectionTarget(textobj)
    }
  }
  return (
    <>
      <div className={"tool-column"}>
        <Pane key={"layer-list"} title={"layers"} collapsable={true}>
          <div className={"toolbar"}>
            <ToolbarActionButton action={AddNewImagePixelLayerAction} />
            <ToolbarActionButton action={AddNewImageObjectLayerAction} />
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
      </div>
      <div className={"editor-view"}>
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
          <IconButton onClick={() => image.undo()} icon={Icons.LeftArrow} tooltip={"undo"} />
          <label>history</label>
          <IconButton onClick={() => image.redo()} icon={Icons.RightArrow} tooltip={"redo"} />
          <Spacer />
          <label>Frame</label>
          <IconButton onClick={navPrevFrame} icon={Icons.LeftArrow} tooltip={"prev frame"} />
          <label>
            {currentFrame} / {image.getPropValue("frameCount")}
          </label>
          <IconButton onClick={navNextFrame} icon={Icons.RightArrow} tooltip={"next frame"} />
          <IconButton onClick={addCopyFrame} icon={Icons.Plus} tooltip={"add frame"} />
        </div>
        <div className={"toolbar"}>
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
                onClick={add_text_object}
                icon={Icons.Plus}
                selected={false}
                text={"new text"}
              />
              <ToggleButton
                icon={Icons.SelectionSelected}
                selected={pixelTool.name === "delete"}
                text={"delete object"}
                onClick={() => deleteSelectedObject()}
              />
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
              if (layer instanceof ImagePixelLayer) {
                const color = image.getFramePixelSurface(layer, currentFrame).getPixel(pt)
                setDrawColor(palette.colors[color])
              }
            }}
            onMouseDown={(e) => {
              if (e.button == 2) return
              if (layer instanceof ImageObjectLayer) {
                objectTool.onMouseDown({
                  layer: layer,
                  pt: canvasToImage(e),
                  e: e,
                  markDirty: () => {
                    setCount(count + 1)
                  },
                  selectedObject: selectedObject,
                  setSelectedObject: setSelectedObject,
                })
              }
              if (layer instanceof ImagePixelLayer) {
                pixelTool.onMouseDown({
                  image: image,
                  surface: image.getFramePixelSurface(layer, currentFrame),
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
              if (layer instanceof ImageObjectLayer) {
                objectTool.onMouseMove({
                  layer: layer,
                  pt: canvasToImage(e),
                  e: e,
                  markDirty: () => {
                    setCount(count + 1)
                  },
                  selectedObject: selectedObject,
                  setSelectedObject: setSelectedObject,
                })
              }
              if (layer instanceof ImagePixelLayer) {
                pixelTool.onMouseMove({
                  image: image,
                  surface: image.getFramePixelSurface(layer, currentFrame),
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
            onMouseUp={(e) => {
              if (layer instanceof ImageObjectLayer) {
                objectTool.onMouseUp({
                  layer: layer,
                  pt: canvasToImage(e),
                  e: e,
                  markDirty: () => {
                    setCount(count + 1)
                  },
                  selectedObject: selectedObject,
                  setSelectedObject: setSelectedObject,
                })
              }
              if (layer instanceof ImagePixelLayer) {
                pixelTool.onMouseUp({
                  image: image,
                  surface: image.getFramePixelSurface(layer, currentFrame),
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
            onKeyDown={(e) => {
              // console.log("keyboard code",e.key)
              if (e.key === "a") {
                navPrevFrame()
              }
              if (e.key === "s") {
                navNextFrame()
              }
            }}
          />
        </div>
      </div>
    </>
  )
}
