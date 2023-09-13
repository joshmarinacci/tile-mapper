import {Size} from "josh_js_util"
import {DialogContext, HBox} from "josh_react_util"
import React, {useContext, useEffect, useState} from "react"

import {useObservableChange} from "./base"
import {MapImpl} from "./defs"
import {ListView} from "./ListView"
import {Changed, EditableDocument} from "./model"
import {NewMapDialog} from "./NewMapDialog"

function MapNameRenderer(props: {
    value: MapImpl,
    selected: MapImpl,
    setSelected: (value: MapImpl) => void
}) {
    return <div onClick={() => props.setSelected(props.value)}>
        {props.value.getPropValue('name') as string}
    </div>
}

export function MapList(props:{
    editable: boolean,
    doc: EditableDocument,
    map: MapImpl,
    setMap: (s: MapImpl) => void
}) {
    const {doc, map, setMap} = props
    const dc = useContext(DialogContext)
    const add_map = () => {
        dc.show(<NewMapDialog onComplete={(map) => {
            doc.addMap(map)
            setMap(map)
        }}/>)
    }
    const delete_map = () => {
        doc.removeMap(map)
        if(doc.getMaps().length > 0)  setMap(doc.getMaps()[0])
    }
    return <div className={'pane'}>
        <header>maps</header>
        {props.editable &&
            <div className={'toolbar'}>
                <button onClick={add_map}>add map</button>
                <button onClick={delete_map}>del map</button>
            </div>}
        <ListView selected={map}
                  setSelected={setMap}
                  renderer={MapNameRenderer}
                  data={doc.getMaps()}
                  style={{}}
                  className={'map-list'}/>
    </div>
}

export function MapProps(props: {
    doc: EditableDocument,
    map: MapImpl,
}) {
    const {map} = props
    const [name, setName] = useState(map.getPropValue('name'))
    // useEffect(() => {
    //     setName(map.getName())
    //     const hand = () => setName(map.getName())
    //     map.addEventListener(Changed, hand)
    //     return () => map.removeEventListener(Changed, hand)
    // }, [map])
    useObservableChange(map,Changed)

    return <div className={'pane'}>
        <header>map props</header>
        <ul className={'props-sheet'}>
            <li>
                <b>width</b>
                <label>{(map.getPropValue('size') as Size).w}</label>
            </li>
            <li>
                <b>height</b>
                <label>{(map.getPropValue('size') as Size).h}</label>
            </li>
            <li>
                <b>name</b>
                <input type={'text'}
                       value={props.map.getPropValue('name') as string}
                       onChange={(e) => props.map.setPropValue('name',e.target.value)}/>
            </li>
        </ul>
    </div>
}

