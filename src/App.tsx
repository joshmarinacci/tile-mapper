import './App.css'

import {
    DialogContainer,
    DialogContext,
    DialogContextImpl,
    PopupContainer,
    PopupContext,
    PopupContextImpl,
} from "josh_react_util"
import React, {useContext, useState} from 'react'

import {DocToBMP, DocToPNG, LoadFileAction, SaveAction, SaveLocalStorageAction} from "./actions"
import {ActorEditView} from "./ActorEditView"
import {ActionRegistry, PropsBase, useWatchAllProps, useWatchProp} from "./base"
import {
    ActionRegistryContext,
    DocContext,
    ToolbarActionButton
} from "./common-components"
import {Actor, GameDoc, GameMap, GameTest, Sheet} from "./datamodel"
import Example from "./example.json"
import {make_doc_from_json} from "./json"
import {MainView} from "./MainView"
import {MapModeView} from "./MapModeView"
import {PropSheet} from "./propsheet"
import {LoadLocalStorageAction,NewDocAction} from "./reactactions"
import {GlobalState} from "./state"
import {TestModeView} from "./TestModeView"
import {TileSheetEditor} from "./TileSheetEditor"
import {ObjectTreeView} from "./treeview"

const AR = new ActionRegistry()
AR.register([
    SaveAction,
    DocToBMP,
    DocToBMP,
    LoadFileAction,
    NewDocAction,
])

const STATE = new GlobalState()
STATE.setPropValue('doc', make_doc_from_json(Example))

function getEditView(state: GlobalState, selection: unknown) {
    if (selection instanceof Sheet) {
        return <TileSheetEditor state={state} sheet={selection as Sheet}/>
    }
    if (selection instanceof Actor) {
        return <ActorEditView state={state} actor={selection as Actor}/>
    }
    if (selection instanceof GameMap) {
        return <MapModeView state={state} map={selection as GameMap}/>
    }
    if (selection instanceof GameTest) {
        return <TestModeView state={state} test={selection as GameTest}/>
    }
    return <div style={{padding: '1rem'}}><h3>Select item from the left</h3></div>
}

function MainWrapper(props:{state:GlobalState}): JSX.Element {
    const [doc, setDoc] = useState(props.state.getPropValue('doc') as GameDoc)
    useWatchProp(props.state, 'doc', () => setDoc(props.state.getPropValue('doc')))
    return <DocContext.Provider value={doc}>
        <Main2/>
    </DocContext.Provider>

}
function Main2() {
    const doc = useContext(DocContext)
    const [selection, setSelection] = useState<PropsBase<unknown> | undefined>(undefined)
    useWatchAllProps(STATE, (s) => setSelection(s.getPropValue('selection')))
    const toolbar = <div className={'toolbar across'}>
        <button className={'logo'}>Tile-Mapper</button>
        <ToolbarActionButton action={NewDocAction} state={STATE}/>
        <ToolbarActionButton action={SaveAction} state={STATE}/>
        <ToolbarActionButton action={LoadFileAction} state={STATE}/>
        <ToolbarActionButton action={DocToPNG} state={STATE}/>
        <ToolbarActionButton action={DocToBMP} state={STATE}/>
        <ToolbarActionButton state={STATE} action={LoadLocalStorageAction}/>
        <ToolbarActionButton action={SaveLocalStorageAction} state={STATE}/>
    </div>
    const left_column = <div className={'tree-wrapper pane'} style={{
        alignSelf: 'stretch',
        overflow: "auto"
    }}>
        <header>Document</header>
        <ObjectTreeView obj={doc} state={STATE} selection={selection}/>
    </div>
    const editView = getEditView(STATE, selection)
    const center_column = <div className={'editor-view'} style={{
        overflow: "auto",
        alignSelf: 'stretch',
    }}>{editView}</div>
    const right_column = <PropSheet target={selection}/>
    return <MainView left={left_column} center={center_column} right={right_column} toolbar={toolbar}/>
}

function App() {
    return <DialogContext.Provider value={new DialogContextImpl()}>
        <PopupContext.Provider value={new PopupContextImpl()}>
            <ActionRegistryContext.Provider value={AR}>
                <MainWrapper state={STATE}/>
                <PopupContainer/>
                <DialogContainer/>
            </ActionRegistryContext.Provider>
        </PopupContext.Provider>
    </DialogContext.Provider>
}

export default App
