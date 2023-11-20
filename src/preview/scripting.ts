import { Point } from "josh_js_util"
import { Actor, Dir } from "retrogami-engine"

import { GameState } from "../engine/gamestate"
import { GameAction, TriggerKind } from "../model/action"
import { ActorInstance } from "../model/gamemap"
import { SoundFX } from "../model/soundfx"
import { SFXPlayer } from "../soundeditor/SoundFXEditorView"

interface SoundProxy {
  play(): void
}

interface ActorProxy {}

interface ScriptEvent {
  trigger: TriggerKind
  source: ActorInstance
  target: ActorInstance
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
  destroyActor(act: ActorInstance): void
}
interface ScriptContextInterface {
  event(): ScriptEvent
  game(): GameContext
}

class ScriptContext implements ScriptContextInterface {
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
  destroyActor(act: ActorInstance) {}
  spawnActor(name: string, options: ActorOptions) {}
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
}

export class ScriptManager {
  private gamestate: GameState
  private gc: GameContextImpl

  constructor(gamestate: GameState) {
    this.gamestate = gamestate
    this.gc = new GameContextImpl(this.gamestate)
  }

  fireEvent(contents: string, trigger: TriggerKind) {
    const act = parseBehaviorScript(contents)
    const evt: ScriptEvent = {
      trigger: trigger,
    }
    const ctx = new ScriptContext(evt, this.gc)
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
            this.fireEvent(act.getPropValue("code"), act.getPropValue("trigger"))
          }
        })
      }
    })
  }
}

export function parseBehaviorScript(contents: string) {
  console.log("contents is", contents)
  return Function(`"use strict";
          const toRadians = (deg) => Math.PI/180*deg; 
          return((function(context){${contents}}))`)()
}
