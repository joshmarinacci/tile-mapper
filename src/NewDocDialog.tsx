import {DialogContext} from "josh_react_util"
import React, {useContext, useState} from "react"

import {DocModel, SheetModel, SpriteModel} from "./defs"
import {
    ImagePalette,
    MINECRAFT,
    PICO8
} from "./model"

function make_new_doc(width: number, height: number, palette:ImagePalette) {
    const doc = new DocModel()
    doc.setPalette(palette)
    const sheet = new SheetModel()
    const img = new SpriteModel(width, height, palette)
    sheet.addSprite(img)
    doc.addSheet(sheet)
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

export function NewDocDialog(props: { onComplete: (doc: DocModel) => void }) {
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
