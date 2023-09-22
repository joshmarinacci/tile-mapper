import {Size} from "josh_js_util"
import {DialogContext} from "josh_react_util"
import React, {useContext, useState} from "react"

import {appendToList} from "./base"
import {
    ImagePalette,
    MINECRAFT,
    PICO8
} from "./common"
import {Doc2, Sheet2, Tile2} from "./datamodel"

function make_new_doc(width: number, height: number, palette:ImagePalette) {
    const TS = new Size(16,16)
    const doc = new Doc2({
        name:'new doc',
        palette: palette,
        tileSize: TS,
    })
    const sheet = new Sheet2({tileSize:TS })
    const tile = new Tile2({size:TS, palette:palette})
    appendToList(sheet,"tiles", tile)
    appendToList(doc,'sheets',sheet)
    return doc
}

type Pal = {
    name:string,
    pal:ImagePalette,
}
const PALS:Pal[] = [
    {
        name:'PICO8',
        pal:PICO8
    },
    {
        name:'Minecraft 16',
        pal:MINECRAFT,
    }
]

export function NewDocDialog(props: { onComplete: (doc: Doc2) => void }) {
    const [width, setWidth] = useState(10)
    const [height, setHeight] = useState(10)
    const [pal, setPal] = useState(PALS[0])
    const dc = useContext(DialogContext)
    const create = () => {
        const doc = make_new_doc(width, height, pal.pal)
        props.onComplete(doc)
        dc.hide()
    }
    return <div className={'dialog'}>
        <header>new document</header>
        <section className={'standard-form'}>
            <label>width</label> <input type={'number'} value={width}
                                        onChange={(e) => setWidth(parseInt(e.target.value))}/>
            <label>height</label> <input type={'number'} value={height}
                                         onChange={(e) => setHeight(parseInt(e.target.value))}/>
            <label>palette</label>
            <select value={pal.name} onChange={e => {
                console.log("new val is",e.target.value)
                const pp = PALS.find(p => p.name === e.target.value) as Pal
                setPal(pp)
            }}>
                {PALS.map(pal => {
                    return <option key={pal.name} value={pal.name}>{pal.name}</option>
                })}
            </select>
        </section>
        <footer>
            <button onClick={() => dc.hide()}>cancel</button>
            <button className={'primary'} onClick={create}>create</button>
        </footer>
    </div>
}
