import './App.css'

import {
    DialogContainer,
    DialogContext,
    DialogContextImpl,
    PopupContainer,
    PopupContext,
    PopupContextImpl,
    Spacer
} from "josh_react_util"
import React, {useContext, useState} from 'react'

import {DocToBMP, DocToPNG, LoadFileAction, SaveAction} from "./actions"
import {ActionRegistry, useWatchAllProps} from "./base"
import {
    ActionRegistryContext,
    EditableLabel,
    ToggleButtonSet,
    ToolbarActionButton
} from "./common-components"
import {DocModel} from "./defs"
import {MapModeView} from "./MapModeView"
import {GlobalState} from "./state"
import {TestModeView} from "./TestModeView"
import {TileModeView} from "./TileModeView"

const AR = new ActionRegistry()
AR.register([
    SaveAction,
    DocToBMP,
    DocToBMP,
    LoadFileAction,
])

const STATE = new GlobalState()

function Main() {
    const [doc,setDoc] = useState(STATE.getPropValue('doc') as DocModel)
    useWatchAllProps(STATE, (s) => {
        setDoc(s.getPropValue('doc') as DocModel)
    })
    const [mode, setMode] = useState(STATE.getPropValue('mode'))
    const dc = useContext(DialogContext)
    // const new_doc = () => {
        // dc.show(<NewDocDialog onComplete={(doc) => setDoc(doc)}/>)
    // }
    return (
        <>
            <div className={'toolbar'}>
                <ToggleButtonSet values={['tiles','maps','tests']}
                                 selected={mode}
                                 onSelect={setMode}
                />
                <Spacer/>
                {/*<button onClick={new_doc}>new</button>*/}
                <ToolbarActionButton action={SaveAction} state={STATE}/>
                <ToolbarActionButton action={LoadFileAction} state={STATE}/>
                <ToolbarActionButton action={DocToPNG} state={STATE}/>
                <ToolbarActionButton action={DocToBMP} state={STATE}/>
                <EditableLabel value={doc.getPropValue('name')} onChange={(str:string)=> doc.setPropValue('name',str)}/>
            </div>
            {mode === 'tiles' && <TileModeView state={STATE} doc={doc}/>}
            {mode === 'maps' && <MapModeView state={STATE} doc={doc}/>}
            {mode === 'tests' && <TestModeView state={STATE} doc={doc}/>}
        </>
    )
}

function App() {
    return <DialogContext.Provider value={new DialogContextImpl()}>
        <PopupContext.Provider value={new PopupContextImpl()}>
            <ActionRegistryContext.Provider value={AR}>
                <Main/>
                <PopupContainer/>
                <DialogContainer/>
            </ActionRegistryContext.Provider>
        </PopupContext.Provider>
    </DialogContext.Provider>
}
export default App
