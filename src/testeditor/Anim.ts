import { Size } from "josh_js_util"
import { PhysicsConstants, TileCache } from "retrogami-engine"

import { GameState } from "../engine/gamestate"

export class Anim {
  private cache: TileCache
  private game_state: GameState | undefined
  private zoom: number
  private callback: () => void
  private playing: boolean
  private physics: PhysicsConstants
  private target: HTMLCanvasElement | undefined
  private keydown_handler: (e: KeyboardEvent) => void
  private keyup_handler: (e: KeyboardEvent) => void

  constructor() {
    this.playing = false
    this.zoom = 1
    this.cache = new TileCache(new Size(8, 8))
    this.keydown_handler = (e: KeyboardEvent) => {
      this.game_state?.getKeyboard().keydown(e.code)
    }
    this.keyup_handler = (e: KeyboardEvent) => {
      this.game_state?.getKeyboard().keyup(e.code)
    }

    this.physics = {
      gravity: 0,
      jump_power: 0,
      friction: 0,
      move_speed_max: 0,
      move_speed: 0,
    }
    this.callback = () => {
      this.drawOnce()
      if (this.playing) requestAnimationFrame(this.callback)
    }
  }

  stop() {
    this.playing = false
    this.log("stopping")
  }

  play() {
    this.log("playing")
    this.playing = true
    requestAnimationFrame(this.callback)
  }

  private log(...args: unknown[]) {
    console.log("Anim", ...args)
  }

  setGamestate(params: { cache: TileCache; game_state: GameState }) {
    this.cache = params.cache
    this.game_state = params.game_state
  }

  drawOnce() {
    if (!this.game_state) return
    const map = this.game_state.getCurrentMap()
    const ctx = this.game_state.getDrawingSurface()
    const vp = this.game_state.getViewport()
    const players = this.game_state.getPlayers()
    this.game_state
      .getPhysics()
      .updatePlayer(players, map.layers, this.game_state.getKeyboard(), this.cache, this.physics)
    this.game_state.getPhysics().updateEnemies(this.game_state.getEnemies(), map.layers, this.cache)
    updateViewport(vp, players, this.zoom)
    // this.log("drawing", players.length, map.layers.length, vp.left())
    ctx.fillStyle = "magenta"
    ctx.save()
    map.layers.forEach((layer) => layer.drawSelf(ctx, vp, this.cache, this.zoom))
    ctx.restore()
  }

  setZoom(zoom: number) {
    this.zoom = zoom
  }

  setPhysicsConstants(phs: PhysicsConstants) {
    this.physics = phs
  }

  setKeyboardTarget(target: HTMLCanvasElement) {
    if (this.target) {
      this.target.removeEventListener("keydown", this.keydown_handler)
      this.target.removeEventListener("keyup", this.keyup_handler)
    }
    this.target = target
    if (this.target) {
      this.target.addEventListener("keydown", this.keydown_handler)
      this.target.addEventListener("keyup", this.keyup_handler)
    }
  }
}
