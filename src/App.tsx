import React, {useEffect, useRef, useState} from 'react';
import {HBox, VBox, toClass} from "josh_react_util";
import './App.css';
import {EditableImage, EditableSheet, ImagePalette, PICO8} from "./common";
import {PixelGridEditor} from "./PixelGridEditor";
import {Point} from "josh_js_util";

const palette:ImagePalette = PICO8
function ListView<T>(props: { selected:T, setSelected:(v:T)=>void, renderer: any, data: any[], style:object }) {
    const Cell = props.renderer
    return <div className={'list-view'} style={props.style} >
        {props.data.map((v,i) => {
            return <div className={'list-item'} key={i}>
                <Cell value={v} selected={props.selected} setSelected={props.setSelected}/>
            </div>
        })}
    </div>
}

function PaletteColorRenderer(props:{value:string, selected:any, setSelected:(value:any)=>void}) {
    return <div
    className={toClass({
        'palette-color':true,
        selected: props.selected===props.value
    })}
        style={{
        backgroundColor:props.value,
        width: '32px',
        height: '32px',
    }} onClick={()=>{
        props.setSelected(props.value)
    }
    }> </div>
}

function TilePreviewRenderer(props:{value:EditableImage, selected:any, setSelected:(value:any)=>void}) {
    const image = props.value
    const ref = useRef<HTMLCanvasElement>(null)
    const redraw = () => {
        if (ref.current) {
            console.log('drawing tile preview')
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
        image.addEventListener('change', hand)
        return () => image.removeEventListener('change', hand)
    },[image]);

    return <canvas ref={ref} className={toClass({
        'tile-preview':true,
        selected:props.selected === props.value
    })} style={{
        width: `${image.width()*8}px`,
        height: `${image.height()*8}px`,
    }}
    width={image.width()}
    height={image.height()}
                   onClick={()=>{
        props.setSelected(props.value)
    }
                   }></canvas>
}

const sheet = new EditableSheet()
const img = new EditableImage()
const img2 = new EditableImage()
sheet.addImage(img)
sheet.addImage(img2)
function App() {
    const [drawColor, setDrawColor] = useState<string>(palette[0])
    const [tile, setTile] = useState<EditableImage|null>(null)
  return (
    <VBox>
      <HBox >
        <button>new</button>
        <button>save</button>
        <button>load</button>
      </HBox>
        <HBox className={'hbox align-top'}>
            <div>sheet list</div>
            <ListView data={palette}
                      renderer={PaletteColorRenderer}
                      selected={drawColor}
                      setSelected={setDrawColor}
                      style={{ maxWidth:'300px' }}/>
            {tile && <PixelGridEditor selectedColor={palette.indexOf(drawColor)} image={tile} palette={palette}/>}
            {!tile && <div>no tile selected</div>}
            <ListView selected={tile}
                      setSelected={setTile}
                      renderer={TilePreviewRenderer}
                      data={sheet.getImages()}
                      style={{maxWidth:'1800px'}}/>
        </HBox>
    </VBox>
  );
}

export default App;
