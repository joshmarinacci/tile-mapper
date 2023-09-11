import React, {useState} from "react"

import {EditableDocument, EditableMap, EditableTest} from "./model"
import {Animator, KeyManager, PlayTest} from "./PlayTest"

const anim:Animator|null = null

export function TestMapPlayer(props: {
    test: EditableTest,
    doc: EditableDocument,
    map: EditableMap
}) {
    const {test, map, doc} = props
    const [playing, setPlaying] = useState(false)
    const startPlaying = () => {
        // if(ref.current) {
        //     const canvas = ref.current as HTMLCanvasElement
        //     setPlaying(true)
        //     const player:Player = {
        //         bounds: new Bounds(10,10,10,10),
        //         velocity: new Point(0,0),
        //         falling:true
        //     }
        //     anim = new Animator(()=> {
        //         // updatePlayer(doc,map,player,keyManager)
        //         // drawViewport(canvas,test,map,doc,player, keyManager)
        //         keyManager.update()
        //     })
        //     anim.start()
        // }
    }
    const stopPlaying = () => {
        setPlaying(false)
        if(anim) anim.stop()
    }
    return <>
        <div className={'toolbar'}>
            <button onClick={()=>startPlaying()}>start</button>
            <button onClick={() => stopPlaying()}>stop</button>
        </div>
        <PlayTest/>
    </>
}
