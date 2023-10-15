import {ArrayGrid, Bounds, Point} from "josh_js_util"
import React from "react"

import { PropsBase, useWatchAllProps } from "../model/base"
import { BooleanDef } from "../model/datamodel"
import { Tool, ToolEvent, ToolOverlayInfo } from "./tool"

type RectToolSettingsType = {
  filled: boolean;
};

export function drawRect(
  layer: ArrayGrid<number>,
  color: number,
  start: Point,
  end: Point,
  selection: Bounds | undefined,
) {
  const i1 = Math.min(start.x, end.x)
  const i2 = Math.max(start.x, end.x)
  const j1 = Math.min(start.y, end.y)
  const j2 = Math.max(start.y, end.y)

  for (let i = i1; i < i2; i++) {
    setPixel(new Point(i, j1), layer, color, selection)
    setPixel(new Point(i, j2), layer, color, selection)
  }
  for (let j = j1; j < j2; j++) {
    setPixel(new Point(i1, j), layer, color, selection)
    setPixel(new Point(i2, j), layer, color, selection)
  }
}

function setPixel(
  point: Point,
  layer: ArrayGrid<number>,
  color: number,
  selection: Bounds | undefined,
) {
  if (selection) {
    if (selection.contains(point)) {
      layer.set(point,color)
    }
  } else {
    layer.set(point,color)
  }
}

export function fillRect(
  layer: ArrayGrid<number>,
  color: number,
  start: Point,
  end: Point,
  selection: Bounds | undefined,
) {
  const i1 = Math.min(start.x, end.x)
  const i2 = Math.max(start.x, end.x)
  const j1 = Math.min(start.y, end.y)
  const j2 = Math.max(start.y, end.y)
  for (let i = i1; i < i2; i++) {
    for (let j = j1; j < j2; j++) {
      setPixel(new Point(i, j), layer, color, selection)
    }
  }
}

export class RectTool extends PropsBase<RectToolSettingsType> implements Tool {
  name: string
  private down: boolean
  private _start: Point
  private _current: Point
  private temp: ArrayGrid<number>

  constructor() {
    super({   filled: BooleanDef,  },  {  filled: false,  }, )
    this.name = "rect"
    this.down = false
    this._start = new Point(0, 0)
    this._current = new Point(0, 0)
    this.temp = new ArrayGrid<number>(1, 1)
  }

  drawOverlay(ovr: ToolOverlayInfo): void {
    if (!this.down) return
    const ctx = ovr.ctx
    const palette = ovr.palette
    const scale = ovr.scale
    ctx.save()
    // ctx.translate(this._start.x * scale, this._start.y * scale)
    this.temp.forEach((n, p) => {
      ctx.fillStyle = palette.colors[n]
      if (n === -1) ctx.fillStyle = "transparent"
      ctx.fillRect(p.x * scale, p.y * scale, 1 * scale, 1 * scale)
    })
    ctx.restore()

/*
    if (this.getPropValue("filled")) {
      ovr.ctx.fillStyle = ovr.palette.colors[ovr.color]
      ovr.ctx.fillRect(
        this.start.x * ovr.scale,
        this.start.y * ovr.scale,
        (this.end.x - this.start.x) * ovr.scale,
        (this.end.y - this.start.y) * ovr.scale,
      )
    } else {
      ovr.ctx.strokeStyle = ovr.palette.colors[ovr.color]
      ovr.ctx.lineWidth = 4
      ovr.ctx.beginPath()
      ovr.ctx.strokeRect(
        this.start.x * ovr.scale,
        this.start.y * ovr.scale,
        (this.end.x - this.start.x) * ovr.scale,
        (this.end.y - this.start.y) * ovr.scale,
      )
    }*/
  }

  onMouseDown(evt: ToolEvent): void {
    if(evt.layer) {
      this.down = true
      this._start = evt.pt.floor()
      this._current = evt.pt.floor()
      const data = evt.layer.getPropValue("data")
      this.temp = new ArrayGrid<number>(data.w, data.h)
      this.temp.fill(() => -1)
      this.temp.set(this._start, evt.color)
      evt.markDirty()
    }
  }

  onMouseMove(evt: ToolEvent): void {
    if (this.down) {
      this._current = evt.pt.floor()
      this.temp.fill(() => -1)
      if (this.getPropValue("filled")) {
        fillRect(
            this.temp,
            evt.color,
            this._start.floor(),
            this._current.floor(),
            evt.selection
        )
      } else {
        drawRect(
            this.temp,
            evt.color,
            this._start.floor(),
            this._current.floor(),
            evt.selection
        )
      }
      evt.markDirty()
    }
  }

  onMouseUp(evt: ToolEvent): void {
    this.down = false
    if (evt.layer) {
      if (this.getPropValue("filled")) {
        fillRect(evt.layer.getPropValue('data'), evt.color, this._start, this._current, evt.selection)
      } else {
        drawRect(evt.layer.getPropValue('data'), evt.color, this._start, this._current, evt.selection)
      }
    }
  }
}

export function RectToolSettings(props: { tool: RectTool }) {
  useWatchAllProps(props.tool)
  return (
    <div>
      <label>filled</label>
      <input
        type={"checkbox"}
        checked={props.tool.getPropValue("filled")}
        onChange={(e) => {
          const v = e.target.checked
          props.tool.setPropValue("filled", v)
        }}
      />
    </div>
  )
}
