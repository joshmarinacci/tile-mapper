import "./App.css";

import {
  DialogContainer,
  DialogContext,
  DialogContextImpl,
  Spacer,
} from "josh_react_util";
import React, { useContext, useState } from "react";

import {
  DocToBMP,
  ExportToJSONAction,
  ImportFromJSONAction,
  SaveLocalStorageAction,
  SavePNGJSONAction,
} from "./actions/actions";
import {
  LoadLocalStorageAction,
  NewDocAction,
  UploadPNGJSONAction,
} from "./actions/reactactions";
import { ActorEditView } from "./ActorEditView";
import {
  ActionRegistryContext,
  DocContext,
  DropdownButton,
  ToolbarActionButton,
} from "./common/common-components";
import { MainView } from "./common/MainView";
import { PopupContainer, PopupContext, PopupContextImpl } from "./common/popup";
import { PropSheet } from "./common/propsheet";
import { ObjectTreeView } from "./common/treeview";
import Example from "./example.json";
import { SImageEditorView } from "./imageeditor/SImageEditorView";
import { make_doc_from_json } from "./io/json";
import { MapModeView } from "./mapeditor/MapModeView";
import {
  ActionRegistry,
  PropsBase,
  useWatchAllProps,
  useWatchProp,
} from "./model/base";
import {
  Actor,
  GameDoc,
  GameMap,
  GameTest,
  Sheet,
  SImage,
} from "./model/datamodel";
import { TileSheetEditor } from "./sheeteditor/TileSheetEditor";
import { GlobalState } from "./state";
import { TestModeView } from "./testeditor/TestModeView";

const AR = new ActionRegistry();
AR.register([
  ExportToJSONAction,
  DocToBMP,
  DocToBMP,
  ImportFromJSONAction,
  NewDocAction,
]);

const STATE = new GlobalState();
STATE.setPropValue("doc", make_doc_from_json(Example));

function getEditView(state: GlobalState, selection: unknown) {
  if (selection instanceof Sheet) {
    return <TileSheetEditor state={state} sheet={selection as Sheet} />;
  }
  if (selection instanceof Actor) {
    return <ActorEditView state={state} actor={selection as Actor} />;
  }
  if (selection instanceof GameMap) {
    return <MapModeView state={state} map={selection as GameMap} />;
  }
  if (selection instanceof GameTest) {
    return <TestModeView state={state} test={selection as GameTest} />;
  }
  if (selection instanceof SImage) {
    return <SImageEditorView state={state} image={selection as SImage} />;
  }
  return (
    <div style={{ padding: "1rem" }}>
      <h3>Select item from the left</h3>
    </div>
  );
}

function MainWrapper(props: { state: GlobalState }): JSX.Element {
  const [doc, setDoc] = useState(props.state.getPropValue("doc") as GameDoc);
  useWatchProp(props.state, "doc", () =>
    setDoc(props.state.getPropValue("doc")),
  );
  return (
    <DocContext.Provider value={doc}>
      <Main2 />
    </DocContext.Provider>
  );
}
function Main2() {
  const doc = useContext(DocContext);
  const [selection, setSelection] = useState<PropsBase<unknown> | undefined>(
    undefined,
  );
  useWatchAllProps(STATE, (s) => setSelection(s.getPropValue("selection")));
  const toolbar = (
    <div className={"toolbar across"}>
      <button className={"logo"}>Tile-Mapper</button>
      <ToolbarActionButton action={NewDocAction} state={STATE} />
      {/*<ToolbarActionButton action={DocToPNG} state={STATE}/>*/}
      {/*<ToolbarActionButton action={DocToBMP} state={STATE}/>*/}
      <ToolbarActionButton state={STATE} action={LoadLocalStorageAction} />
      <ToolbarActionButton
        action={SaveLocalStorageAction}
        state={STATE}
        icon={"save"}
      />
      <Spacer />
      <DropdownButton title={"Export"}>
        <ToolbarActionButton state={STATE} action={SavePNGJSONAction} />
        <ToolbarActionButton state={STATE} action={UploadPNGJSONAction} />
        <ToolbarActionButton action={ExportToJSONAction} state={STATE} />
        <ToolbarActionButton action={ImportFromJSONAction} state={STATE} />
      </DropdownButton>
    </div>
  );
  const left_column = (
    <div
      className={"tree-wrapper pane"}
      style={{
        alignSelf: "stretch",
        overflow: "auto",
      }}
    >
      <header>Document</header>
      <ObjectTreeView obj={doc} state={STATE} selection={selection} />
    </div>
  );
  const editView = getEditView(STATE, selection);
  const center_column = <div className={"editor-view"}>{editView}</div>;
  const right_column = <PropSheet target={selection} />;
  return (
    <MainView
      left={left_column}
      center={center_column}
      right={right_column}
      toolbar={toolbar}
    />
  );
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
  );
}

export default App;
