import { ArrayGrid, Point } from "josh_js_util"
import React from "react"

import { ToggleButton } from "../common/common-components"
import { Icons } from "../common/icons"
import { MapCell } from "../model/datamodel"
import { GameDoc } from "../model/gamedoc"
import { TileLayer } from "../model/gamemap"
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

export function drawTileLayer(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  doc: GameDoc,
  layer: TileLayer,
  scale: number,
  grid: boolean,
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

export function TileLayerToolbar(props: {
  layer: TileLayer
  fillOnce: boolean
  setFillOnce: (fw: boolean) => void
}) {
  const { fillOnce, setFillOnce } = props
  return (
    <div className={"toolbar"}>
      <label>tiles</label>
      <ToggleButton
        selected={fillOnce}
        icon={Icons.PaintBucket}
        onClick={() => setFillOnce(true)}
        text="fill"
      />
    </div>
  )
}

export class TileLayerMouseHandler implements MouseHandler<TileLayer> {
  onMouseDown(args: MouseEventArgs<TileLayer>) {
    const { e, layer, tile, doc, setSelectedTile, fillOnce } = args
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
    if (fillOnce && tile) {
      const cell = layer.getPropValue("data").get(pt)
      bucketFill(layer, cell.tile, tile._id, pt)
      args.setFillOnce(false)
      return
    }
    if (tile) layer.getPropValue("data").set(pt, { tile: tile._id })
  }

  onMouseMove(args: MouseEventArgs<TileLayer>) {
    const { layer, tile, doc } = args
    const tileSize = doc.getPropValue("tileSize")
    const pt = new Point(args.pt.x / tileSize.w, args.pt.y / tileSize.h).floor()
    if (tile) layer.getPropValue("data").set(pt, { tile: tile._id })
  }

  onMouseUp(): void {}

  drawOverlay() {}
}
