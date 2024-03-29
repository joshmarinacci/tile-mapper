import { Size } from "josh_js_util"
import {
  Actor,
  ActorLayer,
  Camera,
  Enemy,
  ImageCache,
  Item,
  KeyboardManager,
  Layer,
  PhysicsManager,
  Player,
  TileCache,
} from "retrogami-engine"

import { Camera as CameraModel } from "../model/camera"
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
  private physics: PhysicsManager
  public tileCache: TileCache
  public imageCache: ImageCache
  public doc: GameDoc

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
    this.doc = doc
    this.canvas.style.border = "1px solid red"
    this.keyboard = new KeyboardManager()
    this.physics = new PhysicsManager()
    this.imageCache = new ImageCache()
    this.tileCache = new TileCache(doc.getPropValue("tileSize"))
    const ts = doc.getPropValue("tileSize")
    const cam = doc.getPropValue("camera") as CameraModel
    cam.getPropValue("viewport")
    this.camera = new Camera()
    this.camera.viewport = cam.getPropValue("viewport").scale(ts.w)
    this.camera.focus = cam.getPropValue("focus").scale(ts.w)
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

  getPhysics() {
    return this.physics
  }

  addLayer(layer: Layer) {
    this.map.layers.push(layer)
  }

  getCamera() {
    return this.camera
  }

  getCanvasSize() {
    return new Size(this.canvas.width, this.canvas.height)
  }

  getCanvas() {
    return this.canvas
  }

  getActors(): Actor[] {
    const actor_layer = this.map.layers.find((layer) => layer.type === "actors")
    if (actor_layer instanceof ActorLayer) {
      return actor_layer.actors
    }
    return []
  }
  getPlayers() {
    return this.getActors().filter((act) => act.type === "player") as Player[]
  }
  getEnemies() {
    return this.getActors().filter((act) => act.type === "enemy") as Enemy[]
  }
  getItems(): Item[] {
    return this.getActors().filter((act) => act.type === "item") as Item[]
  }

  getActorLayers() {
    return this.map.layers.filter((layer) => layer.type === "actors") as ActorLayer[]
  }
}
