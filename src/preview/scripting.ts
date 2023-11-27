import { Bounds, Point } from "josh_js_util"
import { Actor, ActorLayer, Dir } from "retrogami-engine"

import { GameState } from "../engine/gamestate"
import { GameAction, TriggerKind } from "../model/action"
import { ActorInstance } from "../model/gamemap"
import { SoundFX } from "../model/soundfx"
import { SFXPlayer } from "../soundeditor/SoundFXEditorView"

interface ScriptEvent {
  trigger: TriggerKind
  source: Actor
  target: Actor
}
type ActorOptions = {
  position: Point
  direction: Dir
  velocity: Point
}
type ParticleOptions = {
  position: Point
}
type SoundFXOptions = {
  duration: number
}

interface GameSessionStorage {
  get(key: string): unknown
  set(key: string, data: unknown): void
  has(key: string): boolean
}

interface GameContext {
  getStorage(): GameSessionStorage
  spawnActor(name: string, options: ActorOptions): void
  spawnParticleFXAt(name: string, options: ParticleOptions): void
  playSoundAt(name: string, options: SoundFXOptions): void
  destroyActor(act: Actor): void
  log(...args: any[]): void
}
interface ScriptContext {
  event(): ScriptEvent
  game(): GameContext
}

class ScriptContextImpl implements ScriptContext {
  private evt: ScriptEvent
  private gc: GameContext
  constructor(evt: ScriptEvent, gc: GameContext) {
    this.evt = evt
    this.gc = gc
  }
  event(): ScriptEvent {
    return this.evt
  }
  game(): GameContext {
    return this.gc
  }
}

class GameSessionStorageImpl implements GameSessionStorage {
  private _map: Map<string, unknown>
  constructor() {
    this._map = new Map()
  }

  get(key: string): unknown {
    return this._map.get(key)
  }

  has(key: string): boolean {
    return this._map.has(key)
  }

  set(key: string, data: unknown): void {
    this._map.set(key, data)
  }
}
class GameContextImpl implements GameContext {
  private storage: GameSessionStorage
  private sfx: SFXPlayer
  private gamestate: GameState

  constructor(gamestate: GameState) {
    this.gamestate = gamestate
    this.storage = new GameSessionStorageImpl()
    this.sfx = new SFXPlayer()
  }
  getStorage(): GameSessionStorage {
    return this.storage
  }
  destroyActor(act: Actor) {
    if (act.opacity <= 0) return
    act.opacity = 0
    console.log("pretending to destroy actor", act)
  }
  spawnActor(name: string, options: ActorOptions) {
    console.log(`spawing actor ${name} with options`, options)
    const actorModel = this.gamestate.doc
      .getPropValue("actors")
      .find((act) => act.getPropValue("name") === name)
    if (!actorModel) {
      console.error(`no such actor named: "${name}"`)
    }
    if (actorModel) {
      const player = this.gamestate.getPlayers()[0]
      console.log("current player is", player)
      const actor: Actor = {
        type: actorModel.getPropValue("kind"),
        name: actorModel.getPropValue("name"),
        color: "magenta",
        dir: options.direction,
        bounds: Bounds.fromPointSize(options.position, actorModel.getPropValue("viewbox").size()),
        vx: options.velocity.x,
        vy: options.velocity.y,
        originalPosition: new Point(20, 20),
        hidden: false,
        opacity: 1.0,
        tile: {
          uuid: actorModel.getPropValue("sprite"),
        },
      }
      const actor_layer = this.gamestate
        .getCurrentMap()
        .layers.find((layer) => layer.type === "actors")
      if (actor_layer instanceof ActorLayer) {
        actor_layer.actors.push(actor)
      }
    }
  }
  playSoundAt(name: string, options: SoundFXOptions) {
    const sounds: SoundFX[] = this.gamestate.doc
      .getPropValue("assets")
      .filter((a) => a instanceof SoundFX) as unknown as SoundFX[]
    const fx = sounds.find((fx) => fx.getPropValue("name") === name)
    if (fx) {
      this.sfx.testSoundEffect(fx)
    } else {
      console.log(`sound effect named "${name}" not found`)
    }
  }
  spawnParticleFXAt(name: string, options: ParticleOptions) {}
  log(...args: any[]): void {
    console.log(...args)
  }
}

export class ScriptManager {
  private gamestate: GameState
  private gc: GameContextImpl

  constructor(gamestate: GameState) {
    this.gamestate = gamestate
    this.gc = new GameContextImpl(this.gamestate)
  }

  fireEvent(contents: string, trigger: TriggerKind, source: Actor, target?: Actor) {
    const act = parseBehaviorScript(contents)
    const evt: ScriptEvent = {
      trigger: trigger,
      source: source,
      target: target ? target : source,
    }
    const ctx = new ScriptContextImpl(evt, this.gc)
    act(ctx)
  }

  start(actors: Actor[]) {
    this.gc = new GameContextImpl(this.gamestate)
    actors.forEach((play) => {
      if (play.actions) {
        const actions: GameAction[] = play.actions as GameAction[]
        actions.forEach((act) => {
          console.log("player action", act.getPropValue("trigger"))
          if (act.getPropValue("trigger") === "game-start") {
            this.fireEvent(act.getPropValue("code"), act.getPropValue("trigger"), play)
          }
        })
      }
    })
  }
}

export function parseBehaviorScript(contents: string) {
  // console.log("contents is", contents)
  return Function(`"use strict";
          const toRadians = (deg) => Math.PI/180*deg; 
          return((function(context){${contents}}))`)()
}
