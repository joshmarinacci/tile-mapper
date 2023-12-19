import { ArrayGrid, Point, Size } from "josh_js_util"
import React from "react"

import { PropsBase, useWatchAllProps } from "../model/base"
import { BooleanDef } from "../model/datamodel"
import {
  AreaChange,
  ArrayGridPixelSurface,
  FramePixelSurface,
  ImagePixelLayer,
  SImage,
} from "../model/image"
import { PixelTool, PixelToolEvent, PixelToolKeyEvent, ToolOverlayInfo } from "./tool"

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

export function shiftLayer(surf: FramePixelSurface, off: Point) {
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
    this._start = evt.pt
    this._pressed = true
    evt.markDirty()
  }

  onMouseMove(evt: PixelToolEvent): void {
    if (this._pressed) {
      const diff = evt.pt.subtract(this._start)
      this.shiftLayers(evt.image, evt.layer, evt.surface, diff)
      this._start = evt.pt
      evt.markDirty()
    }
  }

  onKeyDown(evt: PixelToolKeyEvent) {
    if (evt.e.key === "ArrowLeft")
      this.shiftLayers(evt.image, evt.layer, evt.surface, new Point(-1, 0))
    if (evt.e.key === "ArrowRight")
      this.shiftLayers(evt.image, evt.layer, evt.surface, new Point(1, 0))
    if (evt.e.key === "ArrowUp")
      this.shiftLayers(evt.image, evt.layer, evt.surface, new Point(0, -1))
    if (evt.e.key === "ArrowDown")
      this.shiftLayers(evt.image, evt.layer, evt.surface, new Point(0, 1))
    evt.markDirty()
  }

  onMouseUp(evt: PixelToolEvent): void {
    console.log("mouse up")
    this._pressed = false
  }

  shiftLayers(image: SImage, layer: ImagePixelLayer, surf: FramePixelSurface, diff: Point) {
    if (diff.x === 0 && diff.y === 0) return
    if (!this.getPropValue("allLayers") && !this.getPropValue("allFrames")) {
      // const surf = image.getFramePixelSurface(layer, 0)
      const prev_data = surf.cloneData()
      shiftLayer(surf, diff)
      const curr_data = surf.cloneData()
      image.appendHistory(new AreaChange(surf, prev_data, curr_data, "shift"))
    }
    if (this.getPropValue("allLayers") && !this.getPropValue("allFrames")) {
      image.getFramePixelSurfaces(0).forEach((surf) => shiftLayer(surf, diff))
    }
    if (!this.getPropValue("allLayers") && this.getPropValue("allFrames")) {
      image.getFramePixelSurfacesForLayer(layer).forEach((surf) => shiftLayer(surf, diff))
    }
    if (this.getPropValue("allLayers") && this.getPropValue("allFrames")) {
      image.getAllFramePixelSurfaces().forEach((surf) => shiftLayer(surf, diff))
    }
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
