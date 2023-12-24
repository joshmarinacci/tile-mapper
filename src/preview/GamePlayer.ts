import {
  ActorDebugOverlay,
  GameContext,
  GameData,
  GridDebugOverlay,
  HTMLCanvasSource,
  JSONGameDoc,
  Layer,
  loadGameData,
  PhysicsDebugOverlay,
  setup_gamestate,
  startLevel,
  startLoop,
  ViewportDebugOverlay,
} from "retrogami-engine"
import { ConsoleInterface } from "retrogami-engine/dist/scripting"

import { Observable } from "../util"

class HealthOverlay implements Layer {
  name: string
  type: "tilemap" | "actors" | "overlay"
  blocking: boolean
  visible: boolean = true
  constructor() {
    this.name = "health"
    this.type = "overlay"
    this.blocking = false
  }
  drawSelf(gc: GameContext): void {
    gc.ctx.fillStyle = "red"
    gc.ctx.fillRect(10, 10, 150, 60)
    gc.ctx.fillStyle = "black"
    gc.ctx.font = "12pt sans-serif"
    const ply = gc.players[0]
    gc.ctx.fillText(`health ${ply.data.health}`, 20, 30)
    gc.ctx.fillText(`health ${ply.data.candy}`, 20, 50)
  }
}

export class GamePlayer extends Observable {
  private layers: Record<string, Layer>
  private running: boolean
  constructor() {
    super()
    this.layers = {}
    this.layers.grid = new GridDebugOverlay()
    this.values.grid = true
    this.layers.physics = new PhysicsDebugOverlay()
    this.values.physics = true
    this.layers.viewport = new ViewportDebugOverlay()
    this.values.viewport = true
    this.layers.actor = new ActorDebugOverlay()
    this.values.actor = true

    this.running = false

    this.values.scale = 2
  }
  setProperty(property: string, value: unknown) {
    super.setProperty(property, value)
    console.log("set property", property, "to", value)
    if (this.layers[property]) this.layers[property].visible = value as boolean
  }

  start(canvas: HTMLCanvasElement, json: unknown, logger: ConsoleInterface) {
    // log("loading game",json,canvas)
    const data: GameData = loadGameData(json as unknown as JSONGameDoc, new HTMLCanvasSource())
    canvas.addEventListener("keydown", (e) => {
      if (!e.repeat) data.keyboard.keydown(e.code)
    })
    canvas.addEventListener("keyup", (e) => {
      if (!e.repeat) data.keyboard.keyup(e.code)
    })

    const gs = setup_gamestate(data, canvas, logger)
    Object.values(this.layers).forEach((layer) => gs.layers.push(layer))
    gs.layers.push(new HealthOverlay())
    gs.scale = 3
    startLevel(gs, data.maps[0])
    startLoop(gs, (gs) => {
      gs.scale = this.values.scale
    })
  }

  stop() {
    this.running = false
  }
}
