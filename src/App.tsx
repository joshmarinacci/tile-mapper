import './App.css'

import {
    DialogContainer,
    DialogContext,
    DialogContextImpl,
    PopupContainer,
    PopupContext,
    PopupContextImpl,
} from "josh_react_util"
import React, {useState} from 'react'

import {DocToBMP, DocToPNG, LoadFileAction, SaveAction} from "./actions"
import {ActorEditView} from "./ActorEditView"
import {ActionRegistry, PropsBase, useWatchAllProps, useWatchProp} from "./base"
import {
    ActionRegistryContext,
    ToolbarActionButton
} from "./common-components"
import {Actor,  GameDoc, GameMap, GameTest, Sheet} from "./datamodel"
import Example from "./example.json"
import {make_doc_from_json} from "./json"
import {MapModeView} from "./MapModeView"
import {PropSheet} from "./propsheet"
import {NewDocAction} from "./reactactions"
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
STATE.setPropValue('doc',make_doc_from_json(Example))

function Main2() {
    const [selection, setSelection] = useState<PropsBase<any>|null>(null)
    const [doc, setDoc] = useState(STATE.getPropValue('doc') as GameDoc)
    useWatchAllProps(STATE, (s) => setSelection(s.getPropValue('selection')))
    useWatchProp(STATE, 'doc', () => setDoc(STATE.getPropValue('doc')))
    let editView= <div style={{
        padding: '1rem',
    }}><h3>Select item from the left</h3></div>
    if(selection) {
        if(selection instanceof Sheet) {
            editView = <TileSheetEditor state={STATE} doc={doc} sheet={selection as Sheet}/>
        }
        if(selection instanceof Actor) {
            editView = <ActorEditView state={STATE} doc={doc} actor={selection as Actor}/>
        }
        if(selection instanceof GameMap) {
            editView = <MapModeView state={STATE} doc={doc} map={selection as GameMap}/>
        }
        if(selection instanceof GameTest) {
            editView = <TestModeView state={STATE} doc={doc} test={selection as GameTest}/>
        }
    }
    return <div className={'main-content'}>
        <div className={'toolbar across'}>
            <button className={'logo'}>Tile-Mapper</button>
            <ToolbarActionButton action={NewDocAction} state={STATE}/>
            <ToolbarActionButton action={SaveAction} state={STATE}/>
            <ToolbarActionButton action={LoadFileAction} state={STATE}/>
            <ToolbarActionButton action={DocToPNG} state={STATE}/>
            <ToolbarActionButton action={DocToBMP} state={STATE}/>
        </div>
        <div className={'tree-wrapper pane'} style={{
            alignSelf:'stretch',
            overflow: "auto"
        }}>
            <header>Document</header>
            <ObjectTreeView obj={doc} state={STATE} selection={selection}/>
        </div>
        <div className={'editor-view'} style={{
            overflow: "auto",
            alignSelf: 'stretch',
        }}>{editView}</div>
        <PropSheet target={selection}/>
        <div className={'toolbar across'}>
            <label>greetings, earthling!</label>
        </div>
    </div>
}

function App() {
    return <DialogContext.Provider value={new DialogContextImpl()}>
        <PopupContext.Provider value={new PopupContextImpl()}>
            <ActionRegistryContext.Provider value={AR}>
                <Main2/>
                <PopupContainer/>
                <DialogContainer/>
            </ActionRegistryContext.Provider>
        </PopupContext.Provider>
    </DialogContext.Provider>
}

export default App
