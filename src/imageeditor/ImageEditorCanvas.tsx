import { Bounds, Point } from "josh_js_util"
import { Spacer } from "josh_react_util"
import React, { MouseEvent, useContext, useEffect, useRef, useState } from "react"

import { IconButton, ToggleButton } from "../common/common-components"
import { Icons } from "../common/icons"
import { PaletteColorPickerPane } from "../common/Palette"
import { useWatchAllProps, useWatchProp } from "../model/base"
import { DocContext, ImageSnapshotContext, StateContext } from "../model/contexts"
import { ImageFrame, ImageLayer, SImage } from "../model/image"
import { wrapNumber } from "../util"
import { drawCanvas, drawImage } from "./drawing"
import { EllipseTool, EllipseToolSettings } from "./ellipse_tool"
import { EraserTool, EraserToolSettings } from "./eraser_tool"
import { FillTool, FillToolSettings } from "./fill_tool"
import { LineTool, LineToolSettings } from "./line_tool"
import { MoveTool, MoveToolSettings } from "./move_tool"
import { PencilTool, PencilToolSettings } from "./pencil_tool"
import { RectTool, RectToolSettings } from "./rect_tool"
import { SelectionTool, SelectionToolSettings } from "./selection_tool"
import { ShiftTool, ShiftToolSettings } from "./shift_tool"
import { PixelTool } from "./tool"

function ToolSettings(props: { tool: PixelTool }) {
  const { tool } = props
  if (tool instanceof PencilTool) return <PencilToolSettings tool={tool} />
  if (tool instanceof EraserTool) return <EraserToolSettings tool={tool} />
  if (tool instanceof RectTool) return <RectToolSettings tool={tool} />
  if (tool instanceof LineTool) return <LineToolSettings tool={tool} />
  if (tool instanceof EllipseTool) return <EllipseToolSettings tool={tool} />
  if (tool instanceof FillTool) return <FillToolSettings tool={tool} />
  if (tool instanceof SelectionTool) return <SelectionToolSettings tool={tool} />
  if (tool instanceof MoveTool) return <MoveToolSettings tool={tool} />
  if (tool instanceof ShiftTool) return <ShiftToolSettings tool={tool} />
  return <div>no tool selected</div>
}

function ImageLayerToolbar(props: {
  pixelTool: PixelTool
  setPixelTool: (tool: PixelTool) => void
}) {
  const { pixelTool, setPixelTool } = props
  return (
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
      {/*<button onClick={() => crop()}>crop</button>*/}
    </div>
  )
}

export function ImageEditorCanvas(props: {
  image: SImage
  layer: ImageLayer
  frame: ImageFrame
  setFrame?: (frame: ImageFrame) => void
}) {
  const { image, layer, frame } = props
  const canvasRef = useRef(null)
  const doc = useContext(DocContext)
  const palette = doc.palette()
  const state = useContext(StateContext)
  const [drawColor, setDrawColor] = useState<string>(palette.colors[0])
  const [selectionRect, setSelectionRect] = useState<Bounds | undefined>()
  const [pixelTool, setPixelTool] = useState<PixelTool>(() => new PencilTool())
  const [zoom, setZoom] = useState(3)
  const [grid, setGrid] = useState(false)
  const [lastPoint, setLastPoint] = useState(new Point(0, 0))
  const [count, setCount] = useState(0)

  useWatchProp(image, "history", () => {
    console.log("history changed")
  })
  const ic = useContext(ImageSnapshotContext)
  useWatchAllProps(image, () => {
    ic.setImageSnapshot(image.getUUID(), image.toSimpleCanvas(doc))
    setCount(count + 1)
  })
  const scale = Math.pow(2, zoom)

  const navPrevFrame = () => {
    if (frame) {
      let index = image.frames().findIndex((f) => f === frame)
      index = wrapNumber(index - 1, 0, image.frames().length)
      if (props.setFrame) props.setFrame(image.frames()[index])
    }
  }
  const navNextFrame = () => {
    if (frame) {
      let index = image.frames().findIndex((f) => f === frame)
      index = wrapNumber(index + 1, 0, image.frames().length)
      if (props.setFrame) props.setFrame(image.frames()[index])
    }
  }

  const tool_settings = <ToolSettings tool={pixelTool} />

  const handle_key_down = (e: React.KeyboardEvent<Element>) => {
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

  const redraw = () => {
    if (canvasRef.current && frame) {
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
  useEffect(() => redraw(), [canvasRef, zoom, scale, grid, image, frame, count])
  const canvasToImage = (e: MouseEvent<HTMLCanvasElement>) => {
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect()
    return new Point(e.clientX, e.clientY)
      .subtract(new Point(rect.left, rect.top))
      .scale(1 / scale)
      .floor()
  }
  // const crop = () => {
  //     if (selectionRect) {
  //         image.crop(selectionRect)
  //         setSelectionRect(undefined)
  //     }
  // }
  return (
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
      </div>
      <div className={"toolbar"}>
        <ImageLayerToolbar pixelTool={pixelTool} setPixelTool={setPixelTool} />
        <div className={"toolbar"}>
          <b>{pixelTool.name} settings</b>
          {tool_settings}
        </div>
      </div>
      <PaletteColorPickerPane drawColor={drawColor} setDrawColor={setDrawColor} palette={palette} />
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
            const color = image.getPixelSurface(layer, frame).getPixel(pt)
            setDrawColor(palette.colors[color])
          }}
          onMouseDown={(e) => {
            setLastPoint(canvasToImage(e))
            if (e.button == 2) return
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
          }}
          onMouseMove={(e) => {
            setLastPoint(canvasToImage(e))
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
          }}
          onMouseUp={(e) => {
            setLastPoint(canvasToImage(e))
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
          }}
        />
        {/*<ImageSnapshotView image={image} scale={5} />*/}
      </div>
    </div>
  )
}
