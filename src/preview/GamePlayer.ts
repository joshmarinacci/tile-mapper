import {
  ActorDebugOverlay,
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

import { Observable } from "../util"

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
  }
  setProperty(property: string, value: boolean) {
    super.setProperty(property, value)
    console.log("set property", property, "to", value)
    if (this.layers[property]) this.layers[property].visible = value
  }

  start(canvas: HTMLCanvasElement, json: any) {
    // log("loading game",json,canvas)
    const data: GameData = loadGameData(json as unknown as JSONGameDoc, new HTMLCanvasSource())
    canvas.addEventListener("keydown", (e) => {
      if (!e.repeat) data.keyboard.keydown(e.code)
    })
    canvas.addEventListener("keyup", (e) => {
      if (!e.repeat) data.keyboard.keyup(e.code)
    })

    const gs = setup_gamestate(data, canvas)
    Object.values(this.layers).forEach((layer) => gs.layers.push(layer))
    // gs.layers.push(new HealthOverlay())
    // gs.scale = 3
    startLevel(gs, data.maps[0])
    startLoop(gs)
  }

  stop() {
    this.running = false
  }
}
