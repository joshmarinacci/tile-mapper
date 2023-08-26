import {
    EditableDocument,
    EditableSheet,
    EditableSprite,
    ImagePalette,
    MINECRAFT,
    PICO8
} from "./model";
import React, {useContext, useState} from "react";
import {DialogContext} from "josh_react_util";

function make_new_doc(width: number, height: number, palette:ImagePalette) {
    const doc = new EditableDocument()
    doc.setPalette(palette)
    const sheet = new EditableSheet()
    const img = new EditableSprite(width, height, palette)
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
];

export function NewDocDialog(props: { onComplete: (doc: EditableDocument) => void }) {
    const [width, setWidth] = useState(10)
    const [height, setHeight] = useState(10)
    const [pal, setPal] = useState(PALS[0])
    const dc = useContext(DialogContext)
    const create = () => {
        let doc = make_new_doc(width, height, pal.pal)
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
                let pp = PALS.find(p => p.name === e.target.value) as Pal
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
