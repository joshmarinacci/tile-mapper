import { Bounds, Point } from "josh_js_util"
import React, { useContext, useEffect, useRef, useState } from "react"

import { duplicate_tile } from "../actions/actions"
import { drawEditableSprite, ImagePalette } from "../common/common"
import { DocContext } from "../common/common-components"
import { PopupContext } from "../common/popup"
import { useWatchAllProps } from "../model/base"
import { Sheet, Tile } from "../model/datamodel"
import { strokeBounds } from "../util"
import { TilePopupMenu } from "./TilePopupMenu"

export class SparseGridModel<T extends Tile> {
  private positions: Map<string, T>
  private inverse: Map<string, Point>

  constructor() {
    this.positions = new Map()
    this.inverse = new Map()
  }

  addAt(value: T) {
    this.positions.set(this.calcKey(value.getPropValue("gridPosition")), value)
    this.inverse.set(value.getUUID(), value.getPropValue("gridPosition"))
  }

  getAllPositionsAndValues() {
    return this.positions.entries()
  }

  addAtEmpty(value: T): Point {
    let pt = new Point(0, 0)
    for (let i = 0; i < 50; i++) {
      if (!this.positions.has(this.calcKey(pt))) {
        value.setPropValue("gridPosition", pt)
        this.addAt(value)
        return pt
      }
      pt = pt.add(new Point(1, 0))
      if (pt.x >= 5) {
        pt = new Point(0, pt.y + 1)
      }
    }
    return pt
  }

  private calcKey(pt: Point) {
    return `${pt.x}_${pt.y}`
  }

  // moveDown(value: T) {
  //     const pt = value.getPropValue('gridPosition')
  //     const pt2 = pt.add(new Point(0, 1))
  //     this.positions.delete(this.calcKey(pt))
  //     this.positions.set(this.calcKey(pt2), value)
  //     value.setPropValue('gridPosition', pt2)
  //     return pt2
  // }
  //
  // moveBy(value: T, offset: Point) {
  //     const pt = value.getPropValue('gridPosition')
  //     const pt2 = pt.add(offset)
  //     const new_key = this.calcKey(pt2)
  //     if (this.positions.has(new_key)) {
  //         console.log("already filled. cannot go")
  //         return pt
  //     }
  //     this.positions.delete(this.calcKey(pt))
  //     this.positions.set(this.calcKey(pt2), value)
  //     value.setPropValue('gridPosition', pt2)
  //     return pt2
  // }

  getAt(pt: Point) {
    const key = this.calcKey(pt)
    if (this.positions.has(key)) {
      return this.positions.get(key)
    } else {
      return undefined
    }
  }

  moveTo(value: T, pos: Point) {
    console.log("doing move to")
    const pt = value.getPropValue("gridPosition")
    const pt2 = pos
    if (pt.x === pt2.x && pt.y === pt2.y) return pt
    const new_key = this.calcKey(pt2)
    if (this.positions.has(new_key)) return pt
    this.positions.delete(this.calcKey(pt))
    this.positions.set(this.calcKey(pt2), value)
    value.setPropValue("gridPosition", pt2)
    return pt2
  }

  getMaxSize() {
    const max = new Point(0, 0)
    for (const [, b] of this.positions.entries()) {
      const pos = b.getPropValue("gridPosition")
      if (pos.x > max.x) max.x = pos.x
      if (pos.y > max.y) max.y = pos.y
    }
    return max
  }
}

export function TileGridView(props: {
  data: Tile[]
  sheet: Sheet
  selected: Tile | undefined
  setSelected: (tile: Tile | undefined) => void
  options: {
    scale: number
    sheet: Sheet
    palette: ImagePalette
    showGrid: boolean
    showNames: boolean
    locked: boolean
  }
}) {
  const { data, options } = props

  const rebuild_model = (sheet: Sheet) => {
    const grid = new SparseGridModel<Tile>()
    const tiles = sheet.getPropValue("tiles")
    const positioned = tiles.filter(
      (t) => t.getPropValue("gridPosition").x >= 0,
    )
    positioned.forEach((t) => grid.addAt(t))
    const unpositioned = tiles.filter(
      (t) => t.getPropValue("gridPosition").x < 0,
    )
    unpositioned.forEach((t) => grid.addAtEmpty(t))
    return grid
  }
  const [model, setModel] = useState(() => rebuild_model(props.sheet))

  const doc = useContext(DocContext)
  const ref = useRef<HTMLCanvasElement>(null)
  const size =
    data.length > 0
      ? data[0].getPropValue("size")
      : doc.getPropValue("tileSize")
  const [down, setDown] = useState<boolean>(false)
  const [target, setTarget] = useState<Point>(new Point(-1, -1))

  const redraw = () => {
    if (ref.current) {
      const ctx = ref.current.getContext("2d") as CanvasRenderingContext2D
      ctx.imageSmoothingEnabled = false
      ctx.fillStyle = "white"
      ctx.fillRect(0, 0, ref.current.width, ref.current.height)
      for (const [, value] of model.getAllPositionsAndValues()) {
        const pos = value.getPropValue("gridPosition").scale(size.w)
        const bounds = Bounds.fromPointSize(pos, size).scale(options.scale)
        ctx.save()
        ctx.translate(bounds.x, bounds.y)
        drawEditableSprite(ctx, options.scale, value, options.palette)
        ctx.restore()
        if (options.showGrid) {
          strokeBounds(
            ctx,
            bounds.grow(-1).add(new Point(0.5, 0.5)),
            "black",
            1,
          )
        }
        if (value === props.selected) {
          strokeBounds(
            ctx,
            bounds.grow(-1).add(new Point(0.5, 0.5)),
            "orange",
            3,
          )
        }
      }
      if (props.selected && down) {
        ctx.strokeStyle = "green"
        const pos = target.scale(size.w)
        const bounds = Bounds.fromPointSize(pos, size).scale(options.scale)
        ctx.save()
        ctx.translate(bounds.x, bounds.y)
        drawEditableSprite(ctx, options.scale, props.selected, options.palette)
        ctx.restore()
        strokeBounds(ctx, bounds.grow(-2), "green", 1)
      }
    }
  }
  useEffect(
    () => redraw(),
    [target, down, options.scale, options.showGrid, model],
  )

  useWatchAllProps(props.sheet, () => setModel(rebuild_model(props.sheet)))

  const pm = useContext(PopupContext)
  const toModel = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect()
    return new Point(e.clientX, e.clientY)
      .subtract(new Point(rect.left, rect.top))
      .scale(1 / options.scale)
      .scale(1 / size.w)
      .floor()
  }
  const showPopup = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    e.stopPropagation()
    const pt = toModel(e)
    const tile = model.getAt(pt)
    setDown(false)
    if (tile) {
      pm.show_at(
        <TilePopupMenu value={tile} grid={model} sheet={options.sheet} />,
        e.target,
        "left",
      )
    }
  }

  const mouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pt = toModel(e)
    const tile = model.getAt(pt)
    if (tile) {
      props.setSelected(tile)
      if (options.locked) return
      setTarget(pt)
      setDown(true)
    }
  }
  const mouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (options.locked) return
    if (down) {
      setTarget(toModel(e))
    }
  }
  const mouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setDown(false)
    if (options.locked) return
    if (props.selected) {
      const target = toModel(e)
      if (e.altKey) {
        const new_tile = duplicate_tile(props.sheet, props.selected)
        new_tile.setPropValue("gridPosition", target)
        model.addAt(new_tile)
      } else {
        model.moveTo(props.selected, target)
      }
    }
    setTarget(new Point(-1, -1))
  }
  const mouseLeave = () => {
    setDown(false)
    setTarget(new Point(-1, -1))
  }

  const maxPosition = model.getMaxSize().add(new Point(2, 2))
  return (
    <canvas
      ref={ref}
      className={"draggable-grid-view"}
      width={size.w * options.scale * maxPosition.x}
      height={size.h * options.scale * maxPosition.y}
      onMouseDown={mouseDown}
      onMouseMove={mouseMove}
      onMouseUp={mouseUp}
      onContextMenu={showPopup}
      onMouseLeave={mouseLeave}
    ></canvas>
  )
}
