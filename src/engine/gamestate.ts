import { Bounds, Size } from "josh_js_util"
import {
  Enemy,
  KeyboardManager,
  Layer,
  PhysicsManager,
  Player,
} from "retrogami-engine"

export type GameMap = {
  name: string;
  layers: Layer[];
}

export class GameState {
  map: GameMap
  private canvas: HTMLCanvasElement
  private viewport: Bounds
  private keyboard: KeyboardManager
  private players: Player[]
  private physics: PhysicsManager
  private enemies: Enemy[]

  constructor(canvas: HTMLCanvasElement, size: Size) {
    this.map = {
      name: "level1",
      layers: [],
    }
    if (canvas) {
      this.canvas = canvas
    } else {
      this.canvas = document.createElement("canvas")
      document.body.append(this.canvas)
      this.canvas.width = size.w
      this.canvas.height = size.h
    }
    this.canvas.style.border = "1px solid red"
    this.keyboard = new KeyboardManager()
    this.viewport = new Bounds(0, 0, size.w, size.h)
    this.players = []
    this.enemies = []
    this.physics = new PhysicsManager()
  }

  addPlayer(player: Player) {
    this.players.push(player)
  }

  getCurrentMap() {
    return this.map
  }

  getDrawingSurface() {
    const ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D
    ctx.fillStyle = "black"
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    return ctx
  }

  getViewport() {
    return this.viewport
  }

  getKeyboard() {
    return this.keyboard
  }

  getPlayers() {
    return this.players
  }

  getEnemies() {
    return this.enemies
  }

  getPhysics() {
    return this.physics
  }

  addLayer(layer: Layer) {
    this.map.layers.push(layer)
  }

  addEnemy(badguy: Enemy) {
    this.enemies.push(badguy)
  }
}
