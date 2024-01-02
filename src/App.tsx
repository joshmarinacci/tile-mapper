import "./App.css"
import "./divider.css"

import { DialogContainer, DialogContext, DialogContextImpl } from "josh_react_util"
import React, { useContext, useEffect, useState } from "react"

import { ActionRegistry, SimpleMenuAction } from "./actions/actions"
import { ExportToJSONAction, ImportFromJSONAction, SaveLocalStorageAction } from "./actions/gamedoc"
import { NewDocAction } from "./actions/reactactions"
import { PopupContainer, PopupContext, PopupContextImpl } from "./common/popup"
import { TreeView } from "./common/treeview"
import Example from "./example.json"
import { make_doc_from_json } from "./io/json"
import { Divider } from "./main/Divider"
import { EditView } from "./main/EditView"
import { MainStatusBar } from "./main/MainStatusBar"
import { MainToolbar } from "./main/MainToolbar"
import { get_class_registry } from "./model"
import { PropsBase, useWatchAllProps, useWatchProp } from "./model/base"
import {
  ActionRegistryContext,
  DocContext,
  ImageSnapshotContext,
  StateContext,
} from "./model/contexts"
import { GameDoc } from "./model/gamedoc"
import { ImageSnapshotCache } from "./model/ImageSnapshotCache"
import { PropSheet } from "./propsheet/propsheet"
import { GlobalState } from "./state"
import { ToasterView } from "./ToasterView"

const reg = get_class_registry()
const AR = new ActionRegistry()
AR.register([ExportToJSONAction, ImportFromJSONAction, NewDocAction, SaveLocalStorageAction])

const ISC = new ImageSnapshotCache()
const gstate = new GlobalState()
gstate.setPropValue("doc", make_doc_from_json(Example, reg))

const LEFT_WIDTH = 250
const RIGHT_WIDTH = 400
function Main3() {
  const state = useContext(StateContext)
  const doc = useContext(DocContext)
  const [selection, setSelection] = useState<PropsBase<unknown> | undefined>(undefined)
  useWatchAllProps(state, (s) => setSelection(s.getPropValue("selection")))
  const [toolWidth, setToolWidth] = useState(450)

  const showLeft = state.getPropValue("showLeft")
  const showRight = state.getPropValue("showRight")
  useEffect(() => {
    const hand = (e) => {
      const act = AR.match(e)
      if (act) {
        e.preventDefault()
        if (act.type === "simple") {
          ;(act as SimpleMenuAction).perform(state).then(() => {
            console.log("action complete")
          })
        }
      }
    }
    window.addEventListener("keydown", hand)
    return () => {
      window.removeEventListener("keydown", hand)
    }
  }, [state])
  return (
    <div
      className={"master-wrapper"}
      style={{
        gridTemplateColumns: `[start] 0px ${
          showLeft ? `[left-sidebar] ${LEFT_WIDTH}px` : ""
        } [tool-column] ${
          toolWidth - (showLeft ? LEFT_WIDTH : 0) - 10
        }px [divider] 1px [editor-view] 1fr ${
          showRight ? `[right-sidebar] ${RIGHT_WIDTH}px` : ""
        } [end]`,
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
            <TreeView />
          </div>
        </div>
      )}
      {<EditView selection={state.getSelectionPath()} />}
      {showRight && (
        <div className={"right-sidebar"}>
          <PropSheet target={state.getSelectionPath().start()} collapsable={false} />
        </div>
      )}
      <MainStatusBar />
      <Divider setToolWidth={setToolWidth} />
    </div>
  )
}

function App() {
  const [doc, setDoc] = useState(gstate.getPropValue("doc") as GameDoc)
  useWatchProp(gstate, "doc", () => setDoc(gstate.getPropValue("doc")))
  return (
    <StateContext.Provider value={gstate}>
      <ImageSnapshotContext.Provider value={ISC}>
        <DocContext.Provider value={doc}>
          <DialogContext.Provider value={new DialogContextImpl()}>
            <PopupContext.Provider value={new PopupContextImpl()}>
              <ActionRegistryContext.Provider value={AR}>
                <Main3 />
                <PopupContainer />
                <DialogContainer />
                <ToasterView />
              </ActionRegistryContext.Provider>
            </PopupContext.Provider>
          </DialogContext.Provider>
        </DocContext.Provider>
      </ImageSnapshotContext.Provider>
    </StateContext.Provider>
  )
}

export default App
