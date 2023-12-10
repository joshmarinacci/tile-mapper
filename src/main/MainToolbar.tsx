import { Spacer } from "josh_react_util"
import React, { useContext } from "react"

import {
  ExportToJSONAction,
  ImportFromJSONAction,
  SaveLocalStorageAction,
  SavePNGJSONAction,
} from "../actions/gamedoc"
import { LoadLocalStorageAction, NewDocAction, UploadPNGJSONAction } from "../actions/reactactions"
import { DropdownButton, IconButton, ToolbarActionButton } from "../common/common-components"
import { Icons } from "../common/icons"
import { StateContext } from "../model/contexts"

export function MainToolbar() {
  const state = useContext(StateContext)
  return (
    <div className={"toolbar across"}>
      <button className={"logo"}>RetroGami</button>
      <ToolbarActionButton action={NewDocAction} />
      <ToolbarActionButton action={LoadLocalStorageAction} />
      <ToolbarActionButton action={SaveLocalStorageAction} />
      <button
        onClick={() => {
          state.getPropValue("toaster").fireMessage("a message here")
        }}
      >
        test
      </button>
      <Spacer />
      <DropdownButton title={"Help"} icon={Icons.QuestionMark}>
        <IconButton
          onClick={() => {
            window.open("https://retrogami.dev/docs/gettingstarted/")
          }}
          icon={Icons.QuestionMark}
          text={"getting started"}
          tooltip={"open the Getting Started Guide in a new tab"}
        />
      </DropdownButton>
      <DropdownButton title={"Export"} icon={Icons.Download}>
        <ToolbarActionButton action={SavePNGJSONAction} />
        <ToolbarActionButton action={UploadPNGJSONAction} />
        <ToolbarActionButton action={ExportToJSONAction} />
        <ToolbarActionButton action={ImportFromJSONAction} />
      </DropdownButton>
    </div>
  )
}
