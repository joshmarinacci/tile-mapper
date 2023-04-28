import React, {useState} from 'react';
import {HBox, VBox} from "josh_react_util";
import './App.css';
import {EditableImage, ImagePalette, PICO8} from "./common";
import {PixelGridEditor} from "./PixelGridEditor";

const palette:ImagePalette = PICO8
function ListView<T>(props: { selected:T, setSelected:(v:T)=>void, renderer: any, data: any[], style:object }) {
    const Cell = props.renderer
    return <ul className={'list-view'} style={props.style} >
        {props.data.map((v,i) => {
            return <li key={i}>{<Cell value={v} selected={props.selected} setSelected={props.setSelected}/>}</li>
        })}
    </ul>
}

function PaletteColorRenderer(props:{value:string, selected:any, setSelected:(value:any)=>void}) {
    return <div style={{
        backgroundColor:props.value,
        width: '32px',
        height: '32px',
        borderWidth:'1px',
        borderStyle: 'solid',
        borderColor: props.selected===props.value?'white':'black',
    }} onClick={()=>{
        props.setSelected(props.value)
    }
    }> </div>
}


const img = new EditableImage()
function App() {
    const [drawColor, setDrawColor] = useState<string>(palette[0])
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
            <PixelGridEditor selectedColor={palette.indexOf(drawColor)} image={img} palette={palette}/>
            <div>tile selector</div>
        </HBox>
    </VBox>
  );
}

export default App;
