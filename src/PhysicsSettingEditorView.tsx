import React from "react"

import { PhysicsSettings } from "./model/physicsSettings"

export function PhysicsSettingEditorView(props: { physics: PhysicsSettings }) {
  return (
    <>
      <div className={"vbox tool-column"}>physics tools</div>
      <div className={"editor-view"}>physics view</div>
    </>
  )
}
