import './App.css'

import {ArrayGrid, Bounds, Point, Size} from "josh_js_util"
import {
    DialogContainer,
    DialogContext,
    DialogContextImpl,
    PopupContainer,
    PopupContext,
    PopupContextImpl,
    Spacer,
    VBox
} from "josh_react_util"
import React, {useContext, useState} from 'react'

import {DocToBMP, DocToPNG, LoadFileAction, SaveAction} from "./actions"
import {ActorEditView} from "./ActorEditView"
import {ActionRegistry, PropsBase, useWatchAllProps} from "./base"
import {
    ActionRegistryContext,
    EditableLabel,
    ToggleButtonSet,
    ToolbarActionButton
} from "./common-components"
import {
    Actor,
    ActorLayer,
    Doc2,
    DocModel,
    Map2,
    MapCell,
    Sheet2,
    Test2,
    Tile2,
    TileLayer2
} from "./defs"
import {MapModeView} from "./MapModeView"
import {PropSheet} from "./propsheet"
import {GlobalState} from "./state"
import {TileSheetEditor} from "./TileSheetEditor"
import {ObjectTreeView} from "./treeview"

const AR = new ActionRegistry()
AR.register([
    SaveAction,
    DocToBMP,
    DocToBMP,
    LoadFileAction,
])

const STATE = new GlobalState()

const doc2 = new Doc2({name: 'doc2'})
{
    const s1 = new Sheet2({name: 'sheet 1', tileSize: new Size(10, 10)})
    const tile1 = new Tile2({name: 'tile1', blocking: false, size: new Size(10, 10)}, doc2.getPropValue('palette'))
    tile1.setPixel(2, new Point(2, 2))
    s1.getPropValue('tiles').push(tile1)
    const s2 = new Sheet2({name: 'sheet 2'})
    doc2.getPropValue('sheets').push(s1)
    doc2.getPropValue('sheets').push(s2)
    const m1 = new Map2({name: 'first map', size: new Size(10, 10)})
    const l1 = new TileLayer2({type: 'tile-layer', name: 'terrain', blocking: true})
    const grid = (l1.getPropValue('data') as ArrayGrid<MapCell>)
    grid.set(new Point(1,0),{tile:tile1._id})
    const l2 = new ActorLayer({type: 'actor-layer', name: 'enemies', blocking: true})
    m1.getPropValue('layers').push(l1)
    m1.getPropValue('layers').push(l2)
    doc2.getPropValue('maps').push(m1)

    const a1 = new Actor({name: 'player', hitbox: new Bounds(0, 0, 16, 16), viewbox: new Bounds(0, 0, 32, 32)})
    const enemy = new Actor({name: 'enemy', hitbox: new Bounds(0, 0, 16, 16), viewbox: new Bounds(0, 0, 16, 16)})
    doc2.getPropValue('actors').push(a1)
    doc2.getPropValue('actors').push(enemy)

    const test1 = new Test2({name: 'test 1', viewport: new Size(10, 10), map: 'unknown'})
    doc2.getPropValue('tests').push(test1)
}
STATE.setPropValue('doc',doc2)

function Main2() {
    const [selection, setSelection] = useState<PropsBase<any>|null>(null)
    const [doc, setDoc] = useState(STATE.getPropValue('doc') as Doc2)
    useWatchAllProps(STATE, (s) => setSelection(s.getPropValue('selection')))
    let editView= <div>nothing to edit</div>
    if(selection) {
        if(selection instanceof Sheet2) {
            editView = <TileSheetEditor state={STATE} doc={doc}/>
        }
        if(selection instanceof Actor) {
            editView = <ActorEditView state={STATE} doc={doc2} actor={selection as Actor}/>
        }
        if(selection instanceof Map2) {
            editView = <MapModeView state={STATE} doc={doc2} map={selection as Map2}/>
        }
    }
    return <div className={'main-content'}>
        <div className={'toolbar across'}>
            <ToolbarActionButton action={SaveAction} state={STATE}/>
            <ToolbarActionButton action={LoadFileAction} state={STATE}/>
            <ToolbarActionButton action={DocToPNG} state={STATE}/>
            <ToolbarActionButton action={DocToBMP} state={STATE}/>
        </div>
        <div className={'tree-wrapper pane'}>
            <ObjectTreeView obj={doc} state={STATE} selection={selection}/>
        </div>
        {editView}
        <PropSheet target={selection}/>
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
