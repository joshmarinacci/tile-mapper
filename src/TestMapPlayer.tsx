import React, {useState} from "react"

import {useObservableChange} from "./common-components"
import {Changed, EditableDocument, EditableMap, EditableTest} from "./model"
import {Animator, KeyManager, PlayTest} from "./PlayTest"

const anim:Animator|null = null

export function TestMapPlayer(props: {
    test: EditableTest,
    doc: EditableDocument,
    map: EditableMap
}) {
    const {test, map, doc} = props
    const [playing, setPlaying] = useState(false)
    useObservableChange(test,Changed)
    const togglePlaying = () => {
        setPlaying(!playing)
    }
    return <>
        <div className={'toolbar'}>
            <button onClick={()=>togglePlaying()}>{playing?"pause":"play"}</button>
            <label>{test.getName()}</label>
        </div>
        <PlayTest playing={playing} doc={doc} map={map} test={test}/>
    </>
}
