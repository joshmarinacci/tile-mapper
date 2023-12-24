import React from "react"

import { useWatchAllProps } from "../model/base"
import { SoundFX } from "../model/soundfx"

// const SFX = new SFXPlayer()
export function SoundFXEditorView(props: { fx: SoundFX }) {
  const fx = props.fx

  useWatchAllProps(fx, () => {
    // SFX.testSoundEffect(fx)
  })
  return (
    <>
      <div className={"vbox tool-column"}>sound effects toosl</div>
      <div className={"editor-view"}>
        sound effects editor
        {/*<button onClick={() => SFX.testSoundEffect(fx)}> test </button>*/}
      </div>
    </>
  )
}
