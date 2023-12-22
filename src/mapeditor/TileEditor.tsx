import { ArrayGrid, Point } from "josh_js_util"
import React from "react"

import { ToggleButton } from "../common/common-components"
import { Icons } from "../common/icons"
import { MapCell } from "../model/datamodel"
import { GameDoc } from "../model/gamedoc"
import { ColorMapLayer, TileLayer } from "../model/gamemap"
import { MouseEventArgs, MouseHandler } from "./editorbase"

function calculateDirections() {
  return [new Point(-1, 0), new Point(1, 0), new Point(0, -1), new Point(0, 1)]
}

export function bucketFill(layer: TileLayer, target: string, replace: string, at: Point) {
  if (target === replace) return
  const cells = layer.getPropValue("data") as ArrayGrid<MapCell>
  const v = cells.get(at)
  if (v.tile !== target) return
  if (v.tile === target) {
    cells.set(at, { tile: replace })
    calculateDirections().forEach((dir) => {
      const pt = at.add(dir)
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (cells.isValidIndex(pt)) bucketFill(layer, target, replace, pt)
    })
  }
}

export function drawColorLayer(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  doc: GameDoc,
  colorMapLayer: ColorMapLayer,
  scale: number,
) {
  ctx.fillStyle = colorMapLayer.getPropValue("color")
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}

export function drawTileLayer(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  doc: GameDoc,
  layer: TileLayer,
  scale: number,
) {
  const size = doc.getPropValue("tileSize")
  const wrapping = layer.getPropValue("wrapping")
  const cells = layer.getPropValue("data") as ArrayGrid<MapCell>
  const maxTileX = Math.floor(canvas.width / size.w / scale)
  const maxTileY = Math.floor(canvas.height / size.h / scale)
  for (let j = 0; j < maxTileY; j++) {
    for (let i = 0; i < maxTileX; i++) {
      const v = wrapping ? cells.get_at(i % cells.w, j % cells.h) : cells.get_at(i, j)
      if (!v) continue
      const x = i * size.w * scale
      const y = j * size.h * scale
      const can = doc.lookup_canvas(v.tile)
      if (can) {
        ctx.drawImage(
          can,
          //src
          0,
          0,
          can.width,
          can.height,
          //dst
          x,
          y,
          size.w * scale,
          size.h * scale,
        )
      }
    }
  }
}

export type TileLayerToolType = "pencil" | "eraser" | "fill" | "filleraser"
export function TileLayerToolbar(props: {
  layer: TileLayer
  selectedTool: TileLayerToolType
  setSelectedTool: (value: TileLayerToolType) => void
}) {
  const { setSelectedTool, selectedTool } = props
  return (
    <div className={"toolbar"}>
      <label>tiles</label>
      <ToggleButton
        selected={selectedTool == "fill"}
        icon={Icons.PaintBucket}
        onClick={() => setSelectedTool("fill")}
        text="fill"
      />
      <ToggleButton
        selected={selectedTool == "filleraser"}
        icon={Icons.PaintBucket}
        onClick={() => setSelectedTool("filleraser")}
        text="fill erase"
      />
      <ToggleButton
        onClick={() => setSelectedTool("pencil")}
        icon={Icons.Pencil}
        selected={selectedTool == "pencil"}
        text={"draw"}
      />
      <ToggleButton
        onClick={() => setSelectedTool("eraser")}
        icon={Icons.Eraser}
        selected={selectedTool === "eraser"}
        text={"erase"}
      />
    </div>
  )
}

export class TileLayerMouseHandler implements MouseHandler<TileLayer> {
  onMouseDown(args: MouseEventArgs<TileLayer>) {
    const { e, layer, tile, doc, setSelectedTile } = args
    if (!layer.getPropValue("visible")) {
      console.log("layer not visible")
      return
    }
    const tileSize = doc.getPropValue("tileSize")
    const pt = new Point(args.pt.x / tileSize.w, args.pt.y / tileSize.h).floor()
    if (e.button === 2) {
      const cell = layer.getPropValue("data").get(pt)
      const tile = doc.lookup_sprite(cell.tile)
      if (tile) setSelectedTile(tile)
      e.stopPropagation()
      e.preventDefault()
      return
    }
    if (args.selectedTool === "eraser") {
      layer.getPropValue("data").set(pt, { tile: "unknown" })
      e.stopPropagation()
      e.preventDefault()
      return
    }
    if (args.selectedTool === "filleraser" && tile) {
      const cell = layer.getPropValue("data").get(pt)
      bucketFill(layer, cell.tile, "unknown", pt)
      return
    }
    if (args.selectedTool === "fill" && tile) {
      const cell = layer.getPropValue("data").get(pt)
      bucketFill(layer, cell.tile, tile._id, pt)
      return
    }
    if (tile) layer.getPropValue("data").set(pt, { tile: tile._id })
  }

  onMouseMove(args: MouseEventArgs<TileLayer>) {
    const { layer, tile, doc } = args
    if (!layer.getPropValue("visible")) {
      console.log("layer not visible")
      return
    }
    const tileSize = doc.getPropValue("tileSize")
    const pt = new Point(args.pt.x / tileSize.w, args.pt.y / tileSize.h).floor()
    if (args.selectedTool === "eraser") {
      layer.getPropValue("data").set(pt, { tile: "unknown" })
      return
    }
    if (tile) layer.getPropValue("data").set(pt, { tile: tile._id })
  }

  onMouseUp(): void {}

  drawOverlay() {}
}
