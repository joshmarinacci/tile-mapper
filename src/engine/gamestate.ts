import {
  Camera,
  Enemy,
  ImageCache,
  KeyboardManager,
  Layer,
  PhysicsManager,
  Player,
  TileCache,
} from "retrogami-engine"

import { GameDoc } from "../model/gamedoc"

export type GameMap = {
  name: string
  layers: Layer[]
}

export class GameState {
  map: GameMap
  private canvas: HTMLCanvasElement
  private camera: Camera
  private keyboard: KeyboardManager
  private players: Player[]
  private physics: PhysicsManager
  private enemies: Enemy[]
  public tileCache: TileCache
  public imageCache: ImageCache

  constructor(canvas: HTMLCanvasElement, doc: GameDoc) {
    this.map = {
      name: "level1",
      layers: [],
    }
    if (canvas) {
      this.canvas = canvas
    } else {
      this.canvas = document.createElement("canvas")
      document.body.append(this.canvas)
      const viewportSize = doc.getPropValue("camera").getPropValue("viewport")
      this.canvas.width = viewportSize.w
      this.canvas.height = viewportSize.h
    }
    this.canvas.style.border = "1px solid red"
    this.keyboard = new KeyboardManager()
    this.players = []
    this.enemies = []
    this.physics = new PhysicsManager()
    this.imageCache = new ImageCache()
    this.tileCache = new TileCache(doc.getPropValue("tileSize"))
    this.camera = new Camera()
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

  getCamera() {
    return this.camera
  }
}
