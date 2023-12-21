import {
  GameData,
  GridDebugOverlay,
  HTMLCanvasSource,
  JSONGameDoc,
  loadGameData,
  setup_gamestate,
  startLevel,
  startLoop,
} from "retrogami-engine"

import { Observable } from "../util"

export class GamePlayer extends Observable {
  private grid: GridDebugOverlay
  constructor() {
    super()
    this.values.grid = true
    this.grid = new GridDebugOverlay()
  }
  setProperty(property: string, value: boolean) {
    super.setProperty(property, value)
    if (property === "grid") {
      // this.grid.setVisible(value)
    }
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
    gs.layers.push(this.grid)
    // gs.layers.push(new HealthOverlay())
    // gs.scale = 3
    startLevel(gs, data.maps[0])
    startLoop(gs)
  }
}
