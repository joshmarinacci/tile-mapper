import { Size } from "josh_js_util"
import { Camera, ImageCache, Layer, TileCache } from "retrogami-engine"

import { GameState } from "../engine/gamestate"

export class GridDebugOverlay implements Layer {
  private state: GameState
  blocking: boolean
  name: string
  type: "overlay"

  constructor(state: GameState) {
    this.state = state
    this.blocking = false
    this.name = "grid debug"
    this.type = "overlay"
  }

  drawSelf(
    ctx: CanvasRenderingContext2D,
    camera: Camera,
    _cache: TileCache,
    _ic: ImageCache,
    scale: number,
  ): void {
    ctx.strokeStyle = "yellow"
    ctx.lineWidth = 1

    ctx.save()
    const vps = camera.viewport.scale(scale)
    ctx.translate(-vps.x, -vps.y)
    const ts = this.state.doc.getPropValue("tileSize") as Size

    ctx.beginPath()
    for (let i = camera.viewport.left() / ts.w; i < camera.viewport.right() / ts.w; i++) {
      ctx.moveTo(i * ts.w * scale, vps.top())
      ctx.lineTo(i * ts.w * scale, vps.bottom())
    }
    for (let i = camera.viewport.top() / ts.h; i < camera.viewport.bottom() / ts.h; i++) {
      ctx.moveTo(camera.viewport.left() * scale, i * ts.h * scale)
      ctx.lineTo(camera.viewport.right() * scale, i * ts.h * scale)
    }
    ctx.stroke()
    ctx.restore()
  }
}
