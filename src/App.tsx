import React, {useState} from 'react';
import {HBox, VBox, DataGrid } from "josh_react_util";
import {Point, Bounds} from "josh_js_util";
import './App.css';

export const PICO8 = [
    '#000000',
    '#1D2B53',
    '#7E2553',
    '#008751',
    '#AB5236',
    '#5F574F',
    '#C2C3C7',
    '#FFF1E8',
    '#FF004D',
    '#FFA300',
    '#FFEC27',
    '#00E436',
    '#29ADFF',
    '#83769C',
    '#FF77A8',
    '#FFCCAA',
    'transparent',
]

type ImagePalette = string[]

const palette:ImagePalette = PICO8


function ListView(props: { renderer: any, data: any[], style:object }) {
    const [selected, setSelected] = useState()
    const Cell = props.renderer
    return <ul className={'list-view'} style={props.style} >
        {props.data.map((v,i) => {
            return <li key={i}>{<Cell value={v} selected={selected} setSelected={setSelected}/>}</li>
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

function App() {
  return (
    <VBox>
      <HBox>
        <button>new</button>
        <button>save</button>
        <button>load</button>
      </HBox>
        <HBox>
            <div>sheet list</div>
            <ListView data={palette} renderer={PaletteColorRenderer} style={{
                maxWidth:'300px'
            }}/>
            <div>pixel editor</div>
        </HBox>
    </VBox>
  );
}

export default App;
