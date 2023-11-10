import { PhysicsConstants } from "retrogami-engine"

import { GameState } from "../engine/gamestate"

export class Anim {
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

  setGamestate(gameState: GameState) {
    this.game_state = gameState
  }

  drawOnce() {
    if (!this.game_state) return
    const map = this.game_state.getCurrentMap()
    const ctx = this.game_state.getDrawingSurface()
    const players = this.game_state.getPlayers()
    this.game_state
      .getPhysics()
      .updatePlayer(
        players,
        map.layers,
        this.game_state.getKeyboard(),
        this.game_state.tileCache,
        this.physics,
        () => {},
      )
    this.game_state
      .getPhysics()
      .updateEnemies(this.game_state.getEnemies(), map.layers, this.game_state.tileCache)
    this.game_state.getCamera().trackActor(players[0])
    ctx.fillStyle = "magenta"
    ctx.save()
    const gs = this.game_state as GameState
    map.layers.forEach((layer) =>
      layer.drawSelf(ctx, gs.getCamera(), gs.tileCache, gs.imageCache, this.zoom),
    )
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
