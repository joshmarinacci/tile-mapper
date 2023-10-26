import "./App.css"

import { DialogContainer, DialogContext, DialogContextImpl } from "josh_react_util"
import React, { ReactElement, useContext, useState } from "react"

import { DocToBMP, ExportToJSONAction, ImportFromJSONAction } from "./actions/actions"
import { NewDocAction } from "./actions/reactactions"
import { ActionRegistryContext, DocContext, StateContext } from "./common/common-components"
import { PopupContainer, PopupContext, PopupContextImpl } from "./common/popup"
import { ObjectTreeView } from "./common/treeview"
import Example from "./example.json"
import { make_doc_from_json } from "./io/json"
import { EditView } from "./main/EditView"
import { MainStatusBar } from "./main/MainStatusBar"
import { MainToolbar } from "./main/MainToolbar"
import { ActionRegistry, PropsBase, useWatchAllProps, useWatchProp } from "./model/base"
import { GameDoc } from "./model/datamodel"
import { PropSheet } from "./propsheet/propsheet"
import { GlobalState } from "./state"

const AR = new ActionRegistry()
AR.register([ExportToJSONAction, DocToBMP, DocToBMP, ImportFromJSONAction, NewDocAction])

const gstate = new GlobalState()
gstate.setPropValue("doc", make_doc_from_json(Example))

function Main3() {
  const state = useContext(StateContext)
  const doc = useContext(DocContext)
  const [selection, setSelection] = useState<PropsBase<unknown> | undefined>(undefined)
  useWatchAllProps(state, (s) => setSelection(s.getPropValue("selection")))

  const showLeft = state.getPropValue("showLeft")
  const showRight = state.getPropValue("showRight")
  return (
    <div
      className={"master-wrapper"}
      style={{
        gridTemplateColumns: `[start] 0px ${
          showLeft ? "[left-sidebar] 150px" : ""
        } [tool-column] 300px [editor-view] 1fr ${showRight ? "[right-sidebar] 300px" : ""} [end]`,
      }}
    >
      <div className={"top-toolbar"}>
        <MainToolbar />
      </div>

      {showLeft && (
        <div className={"left-sidebar"}>
          <div
            className={"tree-wrapper pane"}
            style={{
              alignSelf: "stretch",
              overflow: "auto",
            }}
          >
            <header>Document</header>
            <ObjectTreeView obj={doc} selection={selection} />
          </div>
        </div>
      )}
      {<EditView selection={selection} />}
      {showRight && (
        <div className={"right-sidebar"}>
          <PropSheet target={selection} collapsable={false} />
        </div>
      )}
      <MainStatusBar />
    </div>
  )
}

function App() {
  const [doc, setDoc] = useState(gstate.getPropValue("doc") as GameDoc)
  useWatchProp(gstate, "doc", () => setDoc(gstate.getPropValue("doc")))
  return (
    <StateContext.Provider value={gstate}>
      <DocContext.Provider value={doc}>
        <DialogContext.Provider value={new DialogContextImpl()}>
          <PopupContext.Provider value={new PopupContextImpl()}>
            <ActionRegistryContext.Provider value={AR}>
              <Main3 />
              <PopupContainer />
              <DialogContainer />
            </ActionRegistryContext.Provider>
          </PopupContext.Provider>
        </DialogContext.Provider>
      </DocContext.Provider>
    </StateContext.Provider>
  )
}

export default App
