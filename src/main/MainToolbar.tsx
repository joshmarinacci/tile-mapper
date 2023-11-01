import { Spacer } from "josh_react_util"
import React from "react"

import {
  ExportToJSONAction,
  ImportFromJSONAction,
  SaveLocalStorageAction,
  SavePNGJSONAction,
} from "../actions/actions"
import { LoadLocalStorageAction, NewDocAction, UploadPNGJSONAction } from "../actions/reactactions"
import { DropdownButton, ToolbarActionButton } from "../common/common-components"

export function MainToolbar() {
  return (
    <div className={"toolbar across"}>
      <button className={"logo"}>Tile-Mapper</button>
      <ToolbarActionButton action={NewDocAction} />
      <ToolbarActionButton action={LoadLocalStorageAction} />
      <ToolbarActionButton action={SaveLocalStorageAction} />
      <Spacer />
      <DropdownButton title={"Export"}>
        <ToolbarActionButton action={SavePNGJSONAction} />
        <ToolbarActionButton action={UploadPNGJSONAction} />
        <ToolbarActionButton action={ExportToJSONAction} />
        <ToolbarActionButton action={ImportFromJSONAction} />
      </DropdownButton>
    </div>
  )
}
