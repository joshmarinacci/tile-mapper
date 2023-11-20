import { Bounds, Point } from "josh_js_util"
import { GameContext, KeyCodes, PhysicsConstants } from "retrogami-engine"

import { GameState } from "../engine/gamestate"
import { GameAction } from "../model/action"
import { fillOutsideBounds } from "../util"
import { ScriptManager } from "./scripting"

export class Anim {
  private game_state: GameState | undefined
  private zoom: number
  private callback: () => void
  private playing: boolean
  private physics: PhysicsConstants
  private target: HTMLCanvasElement | undefined
  private keydown_handler: (e: KeyboardEvent) => void
  private keyup_handler: (e: KeyboardEvent) => void
  private script_context: ScriptManager

  constructor() {
    this.playing = false
    this.zoom = 1
    this.keydown_handler = (e: KeyboardEvent) => {
      if (e.repeat) return
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
    if (this.game_state) {
      this.script_context.start(this.game_state.getActors())
    }
  }

  private log(...args: unknown[]) {
    console.log("Anim", ...args)
  }

  setGamestate(gameState: GameState) {
    this.game_state = gameState
    this.script_context = new ScriptManager(this.game_state)
  }

  drawOnce() {
    if (!this.game_state) return
    const gs = this.game_state as GameState
    const map = this.game_state.getCurrentMap()
    const ctx = this.game_state.getDrawingSurface()
    const players = this.game_state.getPlayers()

    players.forEach((play) => {
      const actions: GameAction[] = play.actions as GameAction[]
      actions.forEach((act) => {
        const trigger = act.getPropValue("trigger")
        if (gs.getKeyboard().isJustPressed(KeyCodes.Space)) {
          if (trigger === "jump-action") {
            this.script_context.fireEvent(act.getPropValue("code"), trigger)
          }
        }
        if (gs.getKeyboard().isJustPressed(KeyCodes.ArrowUp)) {
          if (trigger === "primary-action") {
            this.script_context.fireEvent(act.getPropValue("code"), trigger)
          }
        }
      })
    })

    this.game_state
      .getPhysics()
      .updatePlayer(
        players,
        map.layers,
        this.game_state.getKeyboard(),
        this.game_state.tileCache,
        this.physics,
        (col) => {
          console.log("collion happened", col)
        },
      )
    this.game_state
      .getPhysics()
      .updateEnemies(this.game_state.getEnemies(), map.layers, this.game_state.tileCache)
    if (players.length > 0) this.game_state.getCamera().trackActor(players[0])
    ctx.fillStyle = "magenta"
    ctx.save()
    const gc: GameContext = {
      ctx: ctx,
      level: {
        name: map.name,
        layers: map.layers,
      },
      physics: this.game_state.getPhysics(),
      players: players,
      camera: this.game_state.getCamera(),
      scale: this.zoom,
      canvas: this.game_state.getCanvas(),
      ic: gs.imageCache,
      keyboard: gs.getKeyboard(),
      tc: gs.tileCache,
      tileSize: gs.doc.getPropValue("tileSize"),
      levels: [map],
      physicsConstants: this.physics,
    }
    map.layers.forEach((layer) => layer.drawSelf(gc))
    ctx.restore()
    //drow over the boundaries
    const vp = Bounds.fromPointSize(new Point(0, 0), gs.getCamera().viewport.size()).scale(
      this.zoom,
    )
    fillOutsideBounds(ctx, vp, "blue", gs.getCanvasSize())
    this.game_state.getKeyboard().update()
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
