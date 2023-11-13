import { GameState } from "../engine/gamestate"
import { SoundFX } from "../model/soundfx"
import { SFXPlayer } from "../soundeditor/SoundFXEditorView"

interface SoundProxy {
  play(): void
}

interface ActorProxy {}

interface ScriptContextInterface {
  lookupSound(name: string): SoundProxy | undefined

  lookupActor(name: string): ActorProxy | undefined
}

export class ScriptContext implements ScriptContextInterface {
  private gamestate: GameState
  private sfx: SFXPlayer

  constructor(gamestate: GameState) {
    this.gamestate = gamestate
    this.sfx = new SFXPlayer()
  }

  lookupSound(name: string): SoundProxy | undefined {
    const asset = this.gamestate.doc
      .getPropValue("assets")
      .find((ass) => ass.getPropValue("name") === name)
    if (asset instanceof SoundFX) {
      const sfx = this.sfx
      const sound = asset as SoundFX
      return {
        play: function () {
          sfx.testSoundEffect(sound)
        },
      }
    }
  }

  lookupActor(name: string): ActorProxy | undefined {
    const asset = this.gamestate.doc
      .getPropValue("actors")
      .find((ass) => ass.getPropValue("name") === name)
    if (asset) {
      console.log("found an actor")
    }
  }
}

export function parseBehaviorScript(contents: string) {
  console.log("contents is", contents)
  return Function(`"use strict";
          const toRadians = (deg) => Math.PI/180*deg; 
          return((function(context){${contents}}))`)()
}
