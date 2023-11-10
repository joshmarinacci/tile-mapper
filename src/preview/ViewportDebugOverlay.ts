import { Camera, ImageCache, Layer, TileCache } from "retrogami-engine"

import { GameState } from "../engine/gamestate"

export class ViewportDebugOverlay implements Layer {
  private state: GameState
  blocking: boolean
  name: string
  type: "tilemap" | "actors" | "overlay"

  constructor(state: GameState) {
    this.state = state
    this.blocking = false
    this.name = "viewport debug"
    this.type = "overlay"
  }

  drawSelf(
    ctx: CanvasRenderingContext2D,
    camera: Camera,
    _cache: TileCache,
    _ic: ImageCache,
    scale: number,
  ): void {
    ctx.strokeStyle = "RED"
    ctx.lineWidth = 3

    ctx.save()
    const bd = camera.viewport.scale(scale)
    ctx.translate(-bd.x, -bd.y)
    const inset = 5
    ctx.strokeRect(bd.x + inset, bd.y + inset, bd.w - inset * 3, bd.h - inset * 3)
    const bd2 = this.state.getCamera().focus.scale(scale)
    ctx.strokeRect(bd2.x, bd2.y, bd2.w, bd2.h)
    ctx.restore()

    //drwa overlay
    ctx.fillStyle = "black"
    ctx.fillRect(15 - 5, 50 - 20, 100, 20 + 5)
    ctx.fillStyle = "white"
    ctx.fillText(`vp ${camera.viewport.x.toFixed(0)},${camera.viewport.y.toFixed(0)}`, 15, 50)
  }
}
