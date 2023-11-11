import { Spacer } from "josh_react_util"
import React from "react"

import {
  ExportToJSONAction,
  ImportFromJSONAction,
  SaveLocalStorageAction,
  SavePNGJSONAction,
} from "../actions/actions"
import { LoadLocalStorageAction, NewDocAction, UploadPNGJSONAction } from "../actions/reactactions"
import { Icons } from "../common/common"
import { DropdownButton, IconButton, ToolbarActionButton } from "../common/common-components"

export function MainToolbar() {
  return (
    <div className={"toolbar across"}>
      <button className={"logo"}>RetroGami</button>
      <ToolbarActionButton action={NewDocAction} />
      <ToolbarActionButton action={LoadLocalStorageAction} />
      <ToolbarActionButton action={SaveLocalStorageAction} />
      <Spacer />
      <DropdownButton title={"Help"}>
        <IconButton
          onClick={() => {
            window.open("https://retrogami.dev/docs/gettingstarted/")
          }}
          icon={Icons.Sort}
          text={"getting started"}
          tooltip={"open the Getting Started Guide in a new tab"}
        />
      </DropdownButton>
      <DropdownButton title={"Export"}>
        <ToolbarActionButton action={SavePNGJSONAction} />
        <ToolbarActionButton action={UploadPNGJSONAction} />
        <ToolbarActionButton action={ExportToJSONAction} />
        <ToolbarActionButton action={ImportFromJSONAction} />
      </DropdownButton>
    </div>
  )
}
