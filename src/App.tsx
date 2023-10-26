import "./App.css"

import { DialogContainer, DialogContext, DialogContextImpl, Spacer } from "josh_react_util"
import React, { ReactElement, useContext, useState } from "react"

import {
  DocToBMP,
  ExportToJSONAction,
  ImportFromJSONAction,
  SaveLocalStorageAction,
  SavePNGJSONAction,
} from "./actions/actions"
import { LoadLocalStorageAction, NewDocAction, UploadPNGJSONAction } from "./actions/reactactions"
import { ActorEditView } from "./ActorEditView"
import { left_arrow_triangle, right_arrow_triangle } from "./common/common"
import {
  ActionRegistryContext,
  DocContext,
  DropdownButton,
  ToolbarActionButton,
} from "./common/common-components"
import { PopupContainer, PopupContext, PopupContextImpl } from "./common/popup"
import { ObjectTreeView } from "./common/treeview"
import Example from "./example.json"
import { PixelFontEditorView } from "./fonteditor/PixelFontEditorView"
import { ImageEditorView } from "./imageeditor/ImageEditorView"
import { make_doc_from_json } from "./io/json"
import { MapModeView } from "./mapeditor/MapModeView"
import { ActionRegistry, PropsBase, useWatchAllProps, useWatchProp } from "./model/base"
import { Actor, GameDoc, GameMap, GameTest, PixelFont, Sheet, SImage } from "./model/datamodel"
import { PropSheet } from "./propsheet/propsheet"
import { TileSheetEditor } from "./sheeteditor/TileSheetEditor"
import { GlobalState } from "./state"
import { TestModeView } from "./testeditor/TestModeView"

const AR = new ActionRegistry()
AR.register([ExportToJSONAction, DocToBMP, DocToBMP, ImportFromJSONAction, NewDocAction])

const STATE = new GlobalState()
STATE.setPropValue("doc", make_doc_from_json(Example))

function getEditView(state: GlobalState, selection: unknown) {
  if (selection instanceof Sheet) {
    return <TileSheetEditor state={state} sheet={selection as Sheet} />
  }
  if (selection instanceof Actor) {
    return <ActorEditView state={state} actor={selection as Actor} />
  }
  if (selection instanceof GameMap) {
    return <MapModeView state={state} map={selection as GameMap} />
  }
  if (selection instanceof GameTest) {
    return <TestModeView state={state} test={selection as GameTest} />
  }
  if (selection instanceof SImage) {
    return <ImageEditorView state={state} image={selection as SImage} />
  }
  if (selection instanceof PixelFont) {
    return <PixelFontEditorView state={state} font={selection as PixelFont} />
  }
  return (
    <div style={{ padding: "1rem" }} className={"editor-view"}>
      <h3>Select item from the left</h3>
    </div>
  )
}

function MainWrapper(props: { state: GlobalState }): ReactElement {
  const [doc, setDoc] = useState(props.state.getPropValue("doc") as GameDoc)
  useWatchProp(props.state, "doc", () => setDoc(props.state.getPropValue("doc")))
  return (
    <DocContext.Provider value={doc}>
      <Main3 state={props.state} />
    </DocContext.Provider>
  )
}

function MainToolbar() {
  return (
    <div className={"toolbar across"}>
      <button className={"logo"}>Tile-Mapper</button>
      <ToolbarActionButton action={NewDocAction} state={STATE} />
      {/*<ToolbarActionButton action={DocToPNG} state={STATE}/>*/}
      {/*<ToolbarActionButton action={DocToBMP} state={STATE}/>*/}
      <ToolbarActionButton state={STATE} action={LoadLocalStorageAction} />
      <ToolbarActionButton state={STATE} action={SaveLocalStorageAction} />
      <Spacer />
      <DropdownButton title={"Export"}>
        <ToolbarActionButton state={STATE} action={SavePNGJSONAction} />
        <ToolbarActionButton state={STATE} action={UploadPNGJSONAction} />
        <ToolbarActionButton action={ExportToJSONAction} state={STATE} />
        <ToolbarActionButton action={ImportFromJSONAction} state={STATE} />
      </DropdownButton>
    </div>
  )
}

function MainStatusBar(props: { state: GlobalState }) {
  const [showLeft, setShowLeft] = useState(props.state.getPropValue("showLeft"))
  const [showRight, setShowRight] = useState(props.state.getPropValue("showRight"))
  return (
    <div className={"bottom-statusbar hbox"}>
      <button
        onClick={() => {
          console.log("setting to", !showLeft)
          setShowLeft(!showLeft)
          props.state.setPropValue("showLeft", !showLeft)
        }}
      >
        {showLeft ? left_arrow_triangle : right_arrow_triangle}
      </button>
      <Spacer />
      <label>greetings, earthling!</label>
      <Spacer />
      <button
        onClick={() => {
          setShowRight(!showRight)
          props.state.setPropValue("showRight", !showRight)
        }}
      >
        {showRight ? right_arrow_triangle : left_arrow_triangle}
      </button>
    </div>
  )
}

function Main3(props: { state: GlobalState }) {
  const { state } = props
  const doc = useContext(DocContext)
  const [selection, setSelection] = useState<PropsBase<unknown> | undefined>(undefined)
  useWatchAllProps(STATE, (s) => setSelection(s.getPropValue("selection")))

  const showLeft = state.getPropValue("showLeft")
  const showRight = state.getPropValue("showRight")
  console.log(showLeft, " ", showRight)
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
            <ObjectTreeView obj={doc} state={state} selection={selection} />
          </div>
        </div>
      )}
      {getEditView(state, selection)}
      {showRight && (
        <div className={"right-sidebar"}>
          <PropSheet target={selection} collapsable={false} />
        </div>
      )}
      <MainStatusBar state={state} />
    </div>
  )
}

function App() {
  return (
    <DialogContext.Provider value={new DialogContextImpl()}>
      <PopupContext.Provider value={new PopupContextImpl()}>
        <ActionRegistryContext.Provider value={AR}>
          <MainWrapper state={STATE} />
          <PopupContainer />
          <DialogContainer />
        </ActionRegistryContext.Provider>
      </PopupContext.Provider>
    </DialogContext.Provider>
  )
}

export default App
