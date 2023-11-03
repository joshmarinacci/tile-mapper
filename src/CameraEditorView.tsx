import React from "react"

import { Camera } from "./model/camera"

export function CameraEditorView(props: { camera: Camera }) {
  return (
    <>
      <div className={"vbox tool-column"}>camer tools</div>
      <div className={"editor-view"}>camera view</div>
    </>
  )
}
