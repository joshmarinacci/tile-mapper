import {Size} from "josh_js_util"
import {DialogContext} from "josh_react_util"
import React, {useContext, useState} from "react"

import {PropValues} from "./base"
import {MapModel, MapType} from "./defs"


export function NewMapDialog(props: { onComplete: (map: MapModel) => void }) {
    const [width, setWidth] = useState(10)
    const [height, setHeight] = useState(10)
    const dc = useContext(DialogContext)
    const create = () => {
        const vals:PropValues<MapType> = {
            size: new Size(width,height)
        }
        const map = new MapModel(vals)
        props.onComplete(map)
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
