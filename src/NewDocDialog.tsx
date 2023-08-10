import {EditableDocument, EditableSheet, EditableSprite, PICO8} from "./common";
import React, {useContext, useState} from "react";
import {DialogContext} from "josh_react_util";

function make_new_doc(width: number, height: number) {
    const pal = PICO8
    const doc = new EditableDocument()
    const sheet = new EditableSheet()
    const img = new EditableSprite(width, height, pal)
    sheet.addSprite(img)
    doc.addSheet(sheet)
    return doc
}

export function NewDocDialog(props: { onComplete: (doc: EditableDocument) => void }) {
    const [width, setWidth] = useState(10)
    const [height, setHeight] = useState(10)
    const dc = useContext(DialogContext)
    const create = () => {
        let doc = make_new_doc(width, height)
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
        </section>
        <footer>
            <button onClick={() => dc.hide()}>cancel</button>
            <button className={'primary'} onClick={create}>create</button>
        </footer>
    </div>
}
