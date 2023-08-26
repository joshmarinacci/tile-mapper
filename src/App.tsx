import React, {useContext, useState} from 'react';
import {
    DialogContainer,
    DialogContext,
    DialogContextImpl,
    HBox,
    PopupContainer,
    PopupContext,
    PopupContextImpl,
    Spacer,
    VBox
} from "josh_react_util";
import {canvas_to_blob, forceDownloadBlob} from "josh_web_util";
import './App.css';
import {
    canvas_to_bmp,
    EditableDocument,
    EditableSheet,
    EditableSprite,
    fileToJson,
    jsonObjToBlob,
    log,
    make_doc_from_json,
    PICO8,
    sheet_to_canvas
} from "./common";
import {NewDocDialog} from "./NewDocDialog";
import {MapModeView} from "./MapModeView";
import {EditableLabel} from "./common-components";
import {TileModeView} from "./TileModeView";

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
    for(let sheet of doc.getSheets()) {
        const can = sheet_to_canvas(sheet)
        let blob = await canvas_to_blob(can)
        forceDownloadBlob(`${doc.getName()}.${sheet.getName()}.png`,blob)
    }
}

const export_bmp = async (doc:EditableDocument) => {
    const sheet = doc.getSheets()[0]
    const canvas = sheet_to_canvas(sheet)
    const rawData = canvas_to_bmp(canvas, doc.getPalette())
    let blob = new Blob([rawData.data], {type:'image/bmp'})
    forceDownloadBlob(`${sheet.getName()}.bmp`,blob)
}

const load_file = async ():Promise<EditableDocument> => {
    let input_element = document.createElement('input')
    input_element.setAttribute('type','file')
    input_element.style.display = 'none'
    document.body.appendChild(input_element)
    return new Promise((res,rej)=>{
        input_element.addEventListener('change',() => {
            console.log("user picked a file, we hope");
            let files = input_element.files;
            if(!files || files.length <= 0) return;
            let file = files[0]
            console.log(file)
            fileToJson(file).then(data => {
                log("got the data",data)
                let doc = make_doc_from_json(data)
                log('doc iss',doc)
                res(doc)
            })
        })
        input_element.click()
    })
}

function Main() {
    const [doc, setDoc] = useState<EditableDocument>(EMPTY_DOC)
    const [mode, setMode ]= useState('tiles')
    const dc = useContext(DialogContext)
    const save_file = () => {
        let blob = jsonObjToBlob(doc.toJSONDoc())
        forceDownloadBlob(`${doc.getName()}.json`,blob)
    }
    const new_doc = () => {
        dc.show(<NewDocDialog onComplete={(doc) => setDoc(doc)}/>)
    }
    return (
        <VBox>
            <HBox >
                <button onClick={new_doc}>new</button>
                <button onClick={save_file}>save</button>
                <button onClick={async ()=> {
                    let doc = await load_file()
                    setDoc(doc)
                }}>load</button>
                <button onClick={async () => await export_png(doc)}>to PNG</button>
                <button onClick={async () => await export_bmp(doc)}>to BMP</button>
                <EditableLabel value={doc.getName()} onChange={(str:string)=> doc.setName(str)}/>
                <Spacer/>
                <button onClick={()=>setMode('tiles')}>tiles</button>
                <button onClick={()=>setMode('maps')}>maps</button>
            </HBox>
            {mode === 'tiles' && <TileModeView doc={doc}/>}
            {mode === 'maps' && <MapModeView doc={doc}/>}
        </VBox>
    );
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
export default App;
