import { DialogContext } from "josh_react_util"
import React, { useContext } from "react"

import { ReactMenuAction } from "../common/common-components"
import { ListFilesDialog } from "../io/ListFilesDialog"
import { LoadFileDialog } from "../io/LoadPNGJSONFileDialog"
import { appendToList } from "../model/base"
import { DocContext, StateContext } from "../model/contexts"
import { GameTest, Sheet } from "../model/datamodel"
import { GlobalState } from "../state"
import { loadPNGJSON } from "./actions"
import { NewDocDialog } from "./NewDocDialog"

function NewDocButton(props: { state: GlobalState }) {
  const dm = useContext(DialogContext)
  const show = () => {
    dm.show(
      <NewDocDialog
        onComplete={(doc) => {
          props.state.setPropValue("doc", doc)
          props.state.setSelection(doc)
        }}
      />,
    )
  }
  return <button onClick={show}>New</button>
}
export const NewDocAction: ReactMenuAction = {
  type: "react",
  title: "new",
  makeComponent: (state) => {
    return <NewDocButton state={state} />
  },
}
function LoadDocButton(props: { state: GlobalState }): JSX.Element {
  const dm = useContext(DialogContext)
  const showOpenDialog = () => dm.show(<ListFilesDialog state={props.state} />)
  return <button onClick={showOpenDialog}> Open</button>
}

export const LoadLocalStorageAction: ReactMenuAction = {
  type: "react",
  title: "open doc",
  makeComponent: (state) => {
    return <LoadDocButton state={state} />
  },
}

function UploadButton(props: { state: GlobalState }) {
  const { state } = props
  const dm = useContext(DialogContext)

  const showLoadDialog = () => {
    const onComplete = async (file: File) => {
      const doc_proxy = await loadPNGJSON(state, file)
      state.setPropValue("doc", doc_proxy)
    }
    dm.show(<LoadFileDialog state={state} onComplete={onComplete} />)
  }
  return <button onClick={showLoadDialog}>Import doc.JSON.PNG</button>
}

export const UploadPNGJSONAction: ReactMenuAction = {
  type: "react",
  title: "Import Doc",
  makeComponent: (state: GlobalState) => {
    return <UploadButton state={state} />
  },
}

export function AddTestToDocButton() {
  const doc = useContext(DocContext)
  const state = useContext(StateContext)
  return (
    <button
      onClick={() => {
        const test = new GameTest({ name: "a new test" })
        appendToList(doc, "tests", test)
        state.setSelection(test)
      }}
    >
      Add Test To Doc
    </button>
  )
}

export function AddSheetToDocButton(props: { state: GlobalState }) {
  const doc = useContext(DocContext)
  // const state = useContext(StateContext)
  const state = props.state
  return (
    <button
      onClick={() => {
        const sheet = new Sheet({
          name: "unnamed sheet",
          tileSize: doc.getPropValue("tileSize"),
        })
        appendToList(doc, "sheets", sheet)
        state.setSelection(sheet)
      }}
    >
      Add Sheet To Doc
    </button>
  )
}
