import React, { useState } from "react"
import { SFXPlayer, SoundFXParameters } from "retrogami-engine"

import { useWatchAllProps } from "../model/base"
import { SoundFX } from "../model/soundfx"

// const SFX = new SFXPlayer()
export function SoundFXEditorView(props: { fx: SoundFX }) {
  const fx = props.fx
  const [player] = useState(() => new SFXPlayer())

  useWatchAllProps(fx, () => {
    testSound()
  })
  const testSound = () => {
    const opts: SoundFXParameters = {
      name: fx.getPropValue("name"),
      decay: fx.getPropValue("decay"),
      attack: fx.getPropValue("attack"),
      duration: fx.getPropValue("duration"),
      frequency: fx.getPropValue("frequency"),
      peakVolume: fx.getPropValue("peakVolume"),
      pitchBend: fx.getPropValue("pitchBend"),
      oscilatorType: fx.getPropValue("oscilatorType"),
    }
    player.testSoundEffect(opts)
  }
  return (
    <>
      <div className={"vbox tool-column"}>sound effects toosl</div>
      <div className={"editor-view"}>
        sound effects editor
        <button onClick={testSound}> test </button>
      </div>
    </>
  )
}
