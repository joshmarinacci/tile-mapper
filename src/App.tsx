import React, {useEffect, useRef, useState} from 'react';
import {HBox, toClass, VBox} from "josh_react_util";
import {forceDownloadBlob} from "josh_web_util";
import './App.css';
import {
    Changed,
    EditableDocument,
    EditableSheet,
    EditableSprite,
    fileToJson,
    ImagePalette,
    jsonObjToBlob,
    log,
    make_doc_from_json,
    PICO8
} from "./common";
import {PixelGridEditor} from "./PixelGridEditor";
import {Point} from "josh_js_util";
import {ListView} from "./ListView";

const palette:ImagePalette = PICO8

function PaletteColorRenderer(props:{value:string, selected:any, setSelected:(value:any)=>void}) {
    const color = props.value
    return <div
    className={toClass({
        'palette-color':true,
        selected: props.selected===props.value,
        transparent:color==='transparent',
    })}
        style={{
        backgroundColor:color==='transparent'?'magenta':color,
        width: '32px',
        height: '32px',
    }} onClick={()=>{
        props.setSelected(color)
    }
    }> </div>
}

function TilePreviewRenderer(props:{value:EditableSprite, selected:any, setSelected:(value:any)=>void}) {
    const image = props.value
    const scale = 4
    const ref = useRef<HTMLCanvasElement>(null)
    const redraw = () => {
        if (ref.current) {
            let canvas = ref.current
            let ctx = canvas.getContext('2d') as CanvasRenderingContext2D
            ctx.fillStyle = 'red'
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            const scale = 1
            for (let i = 0; i < image.width(); i++) {
                for (let j = 0; j < image.height(); j++) {
                    let v: number = image.getPixel(new Point(i, j))
                    ctx.fillStyle = palette[v]
                    ctx.fillRect(i * scale, j * scale, scale, scale)
                }
            }
        }
    }
    useEffect(() => {
        redraw()
    },[image])

    useEffect(() => {
        let hand = () => redraw()
        image.addEventListener(Changed, hand)
        return () => image.removeEventListener(Changed, hand)
    },[image]);

    return <canvas ref={ref} className={toClass({
        'tile-preview':true,
        selected:props.selected === props.value
    })} style={{
        width: `${image.width()*scale}px`,
        height: `${image.height()*scale}px`,
    }}
    width={image.width()}
    height={image.height()}
                   onClick={()=>{
        props.setSelected(props.value)
    }
                   }></canvas>
}

function SheetNameRenderer(props:{value:EditableSheet, selected:any, setSelected:(value:any)=>void}) {
    return <div onClick={() => props.setSelected(props.value)}>
        {props.value.getName()}
    </div>
}


function TileProperties(props: { tile: EditableSprite }) {
    const tile = props.tile
    const [name, setName] = useState(tile.getName())
    useEffect(() => {
        setName(tile.getName())
        let hand = () => setName(tile.getName())
        tile.addEventListener(Changed, hand)
        return () => tile.removeEventListener(Changed, hand)
    },[tile]);
    return <div className={'tile-properties'}>
        <ul className={'props-sheet'}>
            <li>
                <b>name</b>
                <input type={'text'} value={name} onChange={(e)=>{
                    props.tile.setName(e.target.value)
                }}/>
            </li>
        </ul>
    </div>
}

const EMPTY_DOC = new EditableDocument()
{
    const sheet = new EditableSheet()
    const img = new EditableSprite(10, 10)
    const img2 = new EditableSprite(10, 10)
    sheet.addSprite(img)
    sheet.addSprite(img2)
    EMPTY_DOC.addSheet(sheet)
}

function SheetView(props:{sheet:EditableSheet, tile:EditableSprite, setTile:(tile:EditableSprite)=>void}) {
    const {sheet, tile} = props
    const [tiles, setTiles] = useState(sheet.getImages())
    const [name, setName] = useState(sheet.getName())
    const add_tile = () => {
        let new_tile = new EditableSprite(tile.width(),tile.height())
        sheet.addSprite(new_tile)
    }
    useEffect(() => {
        setName(sheet.getName())
        setTiles(sheet.getImages())
        let hand = () => {
            setName(sheet.getName())
            setTiles(sheet.getImages())
        }
        sheet.addEventListener(Changed, hand)
        return () => sheet.removeEventListener(Changed, hand)
    },[sheet]);
    return <>
        <ul className={'props-sheet'}>
            <li>
                <b>Name</b>
                <input type={'text'} value={name} onChange={(e)=> sheet.setName(e.target.value)}/>
            </li>
        </ul>
        <div className={'toolbar'}>
            <button onClick={add_tile}>add tile</button>
        </div>
        <ListView className={'tile-list'} selected={tile}
              setSelected={props.setTile}
              renderer={TilePreviewRenderer}
              data={tiles}
              style={{}}
    /></>
}

function App() {
    const [doc, setDoc] = useState<EditableDocument>(EMPTY_DOC)
    const [drawColor, setDrawColor] = useState<string>(palette[0])
    const [sheets, setSheets] = useState<EditableSheet[]>(EMPTY_DOC.getSheets())
    const [sheet, setSheet] = useState<EditableSheet|null>(EMPTY_DOC.getSheets()[0])
    const [tile, setTile] = useState<EditableSprite>(EMPTY_DOC.getSheets()[0].getImages()[0])
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
    const add_sheet = () => {
        let sheet = new EditableSheet()
        doc.addSheet(sheet)
    }
    useEffect(() => {
        let hand = () => {
            setSheets(doc.getSheets())
        }
        doc.addEventListener(Changed, hand)
        return () => doc.removeEventListener(Changed, hand)
    },[doc]);
  return (
    <VBox>
      <HBox >
        <button>new</button>
        <button onClick={save_file}>save</button>
        <button onClick={load_file}>load</button>
          <label>{doc.getName()}</label>
      </HBox>
        <div className={'main'}>
            <div className={'pane'}>
                <header>sheets</header>
                <div className={'toolbar'}>
                    <button onClick={add_sheet}>add sheet</button>
                </div>
                <ListView selected={sheet}
                          setSelected={setSheet}
                          renderer={SheetNameRenderer}
                          data={sheets}
                          style={{}}
                          className={'sheet-list'}/>
            </div>
            <div className={'pane'}>
                <header>Tile Sheet</header>
                {sheet&&<SheetView sheet={sheet} tile={tile} setTile={(t:EditableSprite)=> setTile(t)}/>}
            </div>
            <div className={'pane'}>
                <header>Tile Info</header>
                {tile && <TileProperties tile={tile}/>}
            </div>
            <div className={'pane'}>
                <header>Palette</header>
                <ListView className={'palette'} data={palette}
                          renderer={PaletteColorRenderer}
                          selected={drawColor}
                          setSelected={setDrawColor}
                          style={{ maxWidth:'300px' }}/>
            </div>
                {tile && <PixelGridEditor selectedColor={palette.indexOf(drawColor)} image={tile} palette={palette}/>}
                {!tile && <div>no tile selected</div>}
        </div>
    </VBox>
  );
}

export default App;
