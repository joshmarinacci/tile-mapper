import {DialogContext} from "josh_react_util"
import React, {useContext, useState} from "react"

import {EditableMap} from "./model"

export function NewMapDialog(props: { onComplete: (map: EditableMap) => void }) {
    const [width, setWidth] = useState(10)
    const [height, setHeight] = useState(10)
    const dc = useContext(DialogContext)
    const create = () => {
        props.onComplete(new EditableMap(width,height))
        dc.hide()
    }
    return <div className={'dialog'}>
        <header>new map</header>
        <section className={'standard-form'}>
            <label>width</label>
            <input type={'number'} value={width}
                    onChange={(e) => setWidth(parseInt(e.target.value))}/>
            <label>height</label>
            <input type={'number'} value={height}
                     onChange={(e) => setHeight(parseInt(e.target.value))}/>
        </section>
        <footer>
            <button onClick={() => dc.hide()}>cancel</button>
            <button className={'primary'} onClick={create}>create</button>
        </footer>
    </div>
}
