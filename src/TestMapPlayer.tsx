import React, {useState} from "react"

import {GameDoc, GameMap, GameTest} from "./datamodel"
import {PlayTest} from "./PlayTest"
export function TestMapPlayer(props: {
    test: GameTest,
    doc: GameDoc,
    map: GameMap
}) {
    const {test, map, doc} = props
    const [playing, setPlaying] = useState(false)
    const [zoom, setZoom] = useState(3)
    const [grid, setGrid] = useState(false)
    const togglePlaying = () => setPlaying(!playing)
    const [physicsDebug, setPhysicsDebug] = useState(false)
    return <>
        <div className={'toolbar'}>
            <button onClick={()=>togglePlaying()}>{playing?"pause":"play"}</button>
            <label>{test.getPropValue('name') as string}</label>
            <button onClick={()=>setZoom(zoom+1)}>+</button>
            <label>{zoom}</label>
            <button onClick={()=>setZoom(zoom-1)}>-</button>
            <button onClick={()=>setGrid(!grid)}>grid</button>
            <button onClick={()=>setPhysicsDebug(!physicsDebug)}>collisons</button>
        </div>
        <PlayTest
            playing={playing}
            doc={doc}
            map={map}
            test={test}
            zoom={zoom}
            grid={grid}
            physicsDebug={physicsDebug}
        />
    </>
}
