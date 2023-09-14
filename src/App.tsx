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
import {canvas_to_blob, forceDownloadBlob} from "josh_web_util"
import React, {useContext, useState} from 'react'

import {EditableLabel, ToggleButtonSet} from "./common-components"
import {MapModeView} from "./MapModeView"
import {
    canvas_to_bmp,
    EditableDocument,
    EditableSheet,
    EditableSprite,
    fileToJson,
    jsonObjToBlob,
    make_doc_from_json,
    PICO8,
    sheet_to_canvas
} from "./model"
import {NewDocDialog} from "./NewDocDialog"
import {TestModeView} from "./TestModeView"
import {TileModeView} from "./TileModeView"

const EMPTY_DOC = new EditableDocument()
{
    const sheet = new EditableSheet()
    const img = new EditableSprite(10, 10, PICO8)
    const img2 = new EditableSprite(10, 10, PICO8)
    sheet.addSprite(img)
    sheet.addSprite(img2)
    EMPTY_DOC.addSheet(sheet)
}
EMPTY_DOC.setPalette(PICO8)


const export_png = async (doc:EditableDocument) => {
    for(const sheet of doc.getSheets()) {
        const can = sheet_to_canvas(sheet)
        const blob = await canvas_to_blob(can)
        forceDownloadBlob(`${doc.getPropValue('name')}.${sheet.getPropValue('name')}.png`,blob)
    }
}

const export_bmp = async (doc:EditableDocument) => {
    const sheet = doc.getSheets()[0]
    const canvas = sheet_to_canvas(sheet)
    const rawData = canvas_to_bmp(canvas, doc.getPalette())
    const blob = new Blob([rawData.data], {type:'image/bmp'})
    forceDownloadBlob(`${sheet.getPropValue('name')}.bmp`,blob)
}

const load_file = async ():Promise<EditableDocument> => {
    const input_element = document.createElement('input')
    input_element.setAttribute('type','file')
    input_element.style.display = 'none'
    document.body.appendChild(input_element)
    return new Promise((res,rej)=>{
        input_element.addEventListener('change',() => {
            console.log("user picked a file, we hope")
            const files = input_element.files
            if(!files || files.length <= 0) return
            const file = files[0]
            console.log(file)
            fileToJson(file).then(data => res(make_doc_from_json(data as object)))
        })
        input_element.click()
    })
}

type Mode = "tiles" | "maps" | "tests"

function Main() {
    const [doc, setDoc] = useState<EditableDocument>(EMPTY_DOC)
    const [mode, setMode ]= useState<Mode>('tiles')
    const dc = useContext(DialogContext)
    const save_file = () => {
        const blob = jsonObjToBlob(doc.toJSONDoc())
        forceDownloadBlob(`${doc.getPropValue('name')}.json`,blob)
    }
    const new_doc = () => {
        dc.show(<NewDocDialog onComplete={(doc) => setDoc(doc)}/>)
    }
    return (
        <>
            <div className={'toolbar'}>
                <button onClick={new_doc}>new</button>
                <button onClick={save_file}>save</button>
                <button onClick={async ()=> {
                    const doc = await load_file()
                    setDoc(doc)
                }}>load</button>
                <button onClick={async () => await export_png(doc)}>to PNG</button>
                <button onClick={async () => await export_bmp(doc)}>to BMP</button>
                <EditableLabel value={doc.getPropValue('name')} onChange={(str:string)=> doc.setPropValue('name',str)}/>
                <Spacer/>
                <ToggleButtonSet values={['tiles','maps','tests']}
                                 selected={mode}
                                 onSelect={setMode}
                />
            </div>
            {mode === 'tiles' && <TileModeView doc={doc}/>}
            {mode === 'maps' && <MapModeView doc={doc}/>}
            {mode === 'tests' && <TestModeView doc={doc}/>}
        </>
    )
}

function App() {
    return <DialogContext.Provider value={new DialogContextImpl()}>
        <PopupContext.Provider value={new PopupContextImpl()}>
            <Main/>
            <PopupContainer/>
            <DialogContainer/>
        </PopupContext.Provider>
    </DialogContext.Provider>
}
export default App
