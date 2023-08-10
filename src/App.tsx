import React, {useContext, useEffect, useState} from 'react';
import {
    DialogContainer,
    DialogContext,
    DialogContextImpl,
    HBox,
    PopupContainer,
    PopupContext,
    PopupContextImpl,
    VBox
} from "josh_react_util";
import {canvas_to_blob, forceDownloadBlob} from "josh_web_util";
import './App.css';
import {
    canvas_to_bmp,
    Changed,
    EditableDocument,
    EditableSheet,
    EditableSprite,
    fileToJson,
    ImagePalette,
    jsonObjToBlob,
    log,
    make_doc_from_json,
    PICO8,
    sheet_to_canvas
} from "./common";
import {PixelGridEditor} from "./PixelGridEditor";
import {ArrayGrid} from "josh_js_util";
import {PaletteColorPickerPane} from "./Palette";
import {TileSheetView} from "./TileSheetView";
import {TestMap} from "./TestMap";
import {SheetList} from "./SheetList";
import {TileProperties} from "./TileProperties";
import {NewDocDialog} from "./NewDocDialog";

const palette:ImagePalette = PICO8

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

const maparray = new ArrayGrid<EditableSprite>(20,20)

function EditableLabel(props: { onChange: (str: string) => void, value: string }) {
    const [editing, setEditing] = useState(false)
    const [value, setValue] = useState(props.value)
    if(editing) {
        return <input type={'text'} value={value}
                      onChange={(e) => setValue(e.target.value)}
                      onKeyDown={e => {
                          if(e.key === 'Enter') {
                              props.onChange(value)
                              setEditing(false)
                          }
                      }}
        />
    } else {
        return <label
            onDoubleClick={e => setEditing(true)}>{props.value}</label>
    }
}

function Main() {
    const [doc, setDoc] = useState<EditableDocument>(EMPTY_DOC)
    const [drawColor, setDrawColor] = useState<string>(palette[0])
    const [sheets, setSheets] = useState<EditableSheet[]>(EMPTY_DOC.getSheets())
    const [sheet, setSheet] = useState<EditableSheet>(EMPTY_DOC.getSheets()[0])
    const [tile, setTile] = useState<EditableSprite>(EMPTY_DOC.getSheets()[0].getImages()[0])
    const dc = useContext(DialogContext)
    const load_file = () => {
        let input_element = document.createElement('input')
        input_element.setAttribute('type','file')
        input_element.style.display = 'none'
        document.body.appendChild(input_element)
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
                setDoc(doc)
                setSheets(doc.getSheets())
                setSheet(doc.getSheets()[0])
                setTile(doc.getSheets()[0].getImages()[0])
            })
        })
        input_element.click()
    }
    const save_file = () => {
        let blob = jsonObjToBlob(doc.toJSONDoc())
        forceDownloadBlob(`${doc.getName()}.json`,blob)
    }
    const new_doc = () => {
        dc.show(<NewDocDialog onComplete={(doc) => {
            setDoc(doc)
            setSheets(doc.getSheets())
            setSheet(doc.getSheets()[0])
            setTile(doc.getSheets()[0].getImages()[0])
        }}/>)
    }
    const export_png = async () => {
        for(let sheet of doc.getSheets()) {
            const can = sheet_to_canvas(sheet)
            let blob = await canvas_to_blob(can)
            forceDownloadBlob(`${doc.getName()}.${sheet.getName()}.png`,blob)
        }
    }
    const export_bmp = async () => {
        const sheet = doc.getSheets()[0]
        const canvas = sheet_to_canvas(sheet)
        const rawData = canvas_to_bmp(canvas, doc.getPalette())
        let blob = new Blob([rawData.data], {type:'image/bmp'})
        forceDownloadBlob(`${sheet.getName()}.bmp`,blob)
    }
    useEffect(() => {
        let hand = () => setSheets(doc.getSheets())
        doc.addEventListener(Changed, hand)
        return () => doc.removeEventListener(Changed, hand)
    },[doc]);

    return (
        <VBox>
            <HBox >
                <button onClick={new_doc}>new</button>
                <button onClick={save_file}>save</button>
                <button onClick={load_file}>load</button>
                <button onClick={export_png}>to PNG</button>
                <button onClick={export_bmp}>to BMP</button>
                <EditableLabel value={doc.getName()} onChange={(str:string)=>{
                    doc.setName(str)
                }}/>
            </HBox>
            <div className={'main'}>
                <SheetList sheet={sheet} setSheet={setSheet} doc={doc}/>
                <div className={'pane'}>
                    <header>Tile Sheet</header>
                    {sheet&&<TileSheetView sheet={sheet} tile={tile} setTile={(t:EditableSprite)=> setTile(t)} palette={palette}/>}
                </div>
                <div className={'pane'}>
                    <header>Tile Info</header>
                    {tile && <TileProperties tile={tile}/>}
                </div>
                <PaletteColorPickerPane drawColor={drawColor} setDrawColor={setDrawColor} palette={palette}/>
                {tile && <PixelGridEditor
                    selectedColor={palette.indexOf(drawColor)}
                    setSelectedColor={(n)=> setDrawColor(palette[n])}
                    image={tile} palette={palette}/>}
                {!tile && <div>no tile selected</div>}
                <div className={'pane'}>
                    <header>Test</header>
                    <TestMap tile={tile} mapArray={maparray}/>
                </div>
            </div>
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
