import React, {useState} from "react"

import {DocModel, MapModel, TestModel} from "./defs"
import {PlayTest} from "./PlayTest"
export function TestMapPlayer(props: {
    test: TestModel,
    doc: DocModel,
    map: MapModel
}) {
    const {test, map, doc} = props
    const [playing, setPlaying] = useState(false)
    const [zoom, setZoom] = useState(2)
    const [grid, setGrid] = useState(true)
    const togglePlaying = () => {
        setPlaying(!playing)
    }
    return <>
        <div className={'toolbar'}>
            <button onClick={()=>togglePlaying()}>{playing?"pause":"play"}</button>
            <label>{test.getPropValue('name') as string}</label>
            <button onClick={()=>setZoom(zoom+1)}>+</button>
            <label>{zoom}</label>
            <button onClick={()=>setZoom(zoom-1)}>-</button>
            <button onClick={()=>setGrid(!grid)}>grid</button>
        </div>
        <PlayTest
            playing={playing}
            doc={doc} map={map}
            test={test} zoom={zoom}
            grid={grid}
        />
    </>
}
