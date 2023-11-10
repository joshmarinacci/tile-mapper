import { ActorLayer, Camera, ImageCache, Layer, TileCache } from "retrogami-engine"

import { GameState } from "../engine/gamestate"

export class ActorDebugOverlay implements Layer {
  blocking: boolean
  name: string
  type: "tilemap" | "actors" | "overlay"
  private state: GameState

  constructor(state: GameState) {
    this.name = "debug actors"
    this.blocking = false
    this.type = "overlay"
    this.state = state
  }

  drawSelf(
    ctx: CanvasRenderingContext2D,
    camera: Camera,
    _cache: TileCache,
    _ic: ImageCache,
    scale: number,
  ): void {
    ctx.save()
    ctx.strokeStyle = "yellow"
    ctx.lineWidth = 1

    this.state.getCurrentMap().layers.forEach((lyr) => {
      if (lyr.type === "actors") {
        ;(lyr as ActorLayer).actors.forEach((act) => {
          ctx.save()
          ctx.globalAlpha = 0.2
          ctx.fillStyle = act.color
          const b = act.bounds.add(camera.viewport.position().scale(-1)).scale(scale)
          ctx.fillRect(b.x, b.y, b.w, b.h)
          ctx.globalAlpha = 1.0
          ctx.strokeRect(b.x, b.y, b.w, b.h)
          ctx.restore()
        })
      }
    })
  }
}
