import { ArrayGrid, Point, Size } from "josh_js_util"
import React from "react"

import { PropsBase, useWatchAllProps } from "../model/base"
import { BooleanDef } from "../model/datamodel"
import { ArrayGridPixelSurface, FramePixelSurface } from "../model/image"
import { PixelTool, PixelToolEvent, ToolOverlayInfo } from "./tool"

type ShiftToolSettingsType = {
  allLayers: boolean
  allFrames: boolean
}

function wrap(point: Point, size: Size): Point {
  const pt = point.copy()
  if (point.x >= size.w) {
    pt.x = point.x % size.w
  }
  if (point.x < 0) {
    pt.x = (point.x + size.w) % size.w
  }
  if (point.y >= size.h) {
    pt.y = point.y % size.h
  }
  if (point.y < 0) {
    pt.y = (point.y + size.h) % size.h
  }
  return pt
}

function shiftLayer(surf: FramePixelSurface, off: Point) {
  const pixels = ArrayGrid.fromSize(surf.size())
  pixels.forEach((v, n) => {
    pixels.set(n, surf.getPixel(n))
  })
  pixels.forEach((v, n) => {
    surf.setPixel(wrap(n.add(off), surf.size()), v)
  })
}

export class ShiftTool extends PropsBase<ShiftToolSettingsType> implements PixelTool {
  private _pressed: boolean
  private _start: Point
  private temp: ArrayGridPixelSurface
  constructor() {
    super({ allLayers: BooleanDef, allFrames: BooleanDef }, { allLayers: false, allFrames: false })
    this._pressed = false
    this.name = "shift"
    this._start = new Point(0, 0)
    this.temp = new ArrayGridPixelSurface(new ArrayGrid<number>(1, 1))
  }

  name: string

  drawOverlay(ovr: ToolOverlayInfo): void {
    if (!this._pressed) return
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
  }

  onMouseDown(evt: PixelToolEvent): void {
    console.log("mouse pressed")
    this._start = evt.pt
    this._pressed = true
    evt.markDirty()
  }

  onMouseMove(evt: PixelToolEvent): void {
    if (this._pressed) {
      const diff = evt.pt.subtract(this._start)
      if (diff.x !== 0 || diff.y !== 0) {
        if (!this.getPropValue("allLayers") && !this.getPropValue("allFrames")) {
          const surf = evt.image.getFramePixelSurface(evt.layer, 0)
          shiftLayer(surf, diff)
        }
        if (this.getPropValue("allLayers") && !this.getPropValue("allFrames")) {
          evt.image.getFramePixelSurfaces(0).forEach((surf) => shiftLayer(surf, diff))
        }
        if (!this.getPropValue("allLayers") && this.getPropValue("allFrames")) {
          evt.image
            .getFramePixelSurfacesForLayer(evt.layer)
            .forEach((surf) => shiftLayer(surf, diff))
        }
        if (this.getPropValue("allLayers") && this.getPropValue("allFrames")) {
          evt.image.getAllFramePixelSurfaces().forEach((surf) => shiftLayer(surf, diff))
        }
        evt.markDirty()
      }
      this._start = evt.pt
    }
  }

  onMouseUp(evt: PixelToolEvent): void {
    console.log("mouse up")
    this._pressed = false
  }
}

export function ShiftToolSettings(props: { tool: ShiftTool }) {
  useWatchAllProps(props.tool)
  return (
    <div>
      <label>all layers</label>
      <input
        type={"checkbox"}
        checked={props.tool.getPropValue("allLayers")}
        onChange={(e) => {
          props.tool.setPropValue("allLayers", e.target.checked)
        }}
      />
      <label>all frames</label>
      <input
        type={"checkbox"}
        checked={props.tool.getPropValue("allFrames")}
        onChange={(e) => {
          props.tool.setPropValue("allFrames", e.target.checked)
        }}
      />
    </div>
  )
}
