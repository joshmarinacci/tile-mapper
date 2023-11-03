import React from "react"

import { ParticleFX } from "../model/particlefx"

export function ParticleFXEditorView(props: { fx: ParticleFX }) {
  return (
    <>
      <div className={"vbox tool-column"}>particle tools</div>
      <div className={"editor-view"}>particle effects view</div>
    </>
  )
}
