import React from "react"

import { SoundFX } from "../model/soundfx"

export function SoundFXEditorView(props: { fx: SoundFX }) {
  return (
    <>
      <div className={"vbox tool-column"}>sound effects toosl</div>
      <div className={"editor-view"}>sound effects editor</div>
    </>
  )
}
