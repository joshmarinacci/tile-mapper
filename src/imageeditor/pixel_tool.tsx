import { ArrayGrid, Point } from "josh_js_util"

import { DefList, PropsBase, PropValues } from "../model/base"
import { PixelToolEvent, ToolOverlayInfo } from "./tool"

export abstract class BasePixelTool<Type> extends PropsBase<Type> {
  name: string
  protected _down: boolean
  protected _start: Point
  protected _current: Point
  protected temp: ArrayGrid<number>

  constructor(defs: DefList<Type>, options?: PropValues<Type>) {
    super(defs, options)
    this.name = "some tool"
    this._down = false
    this._start = new Point(0, 0)
    this._current = new Point(0, 0)
    this.temp = new ArrayGrid<number>(1, 1)
  }

  drawOverlay(ovr: ToolOverlayInfo): void {
    if (!this._down) return
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
    if (evt.layer) {
      this._down = true
      this._start = evt.pt.floor()
      this._current = evt.pt.floor()
      const data = evt.layer.getPropValue("data")
      this.temp = new ArrayGrid<number>(data.w, data.h)
      this.temp.fill(() => -1)
      this.drawPixels(evt, this.temp, false)
      evt.markDirty()
    }
  }

  onMouseMove(evt: PixelToolEvent): void {
    if (this._down) {
      this._current = evt.pt.floor()
      this.drawPixels(evt, this.temp, false)
      evt.markDirty()
    }
  }

  onMouseUp(evt: PixelToolEvent): void {
    this._down = false
    if (evt.layer) {
      this.drawPixels(evt, evt.layer.getPropValue("data"), true)
      this.temp.fill(() => -1)
    }
    evt.markDirty()
  }

  abstract drawPixels(evt: PixelToolEvent, target: ArrayGrid<number>, final: boolean): void
}
