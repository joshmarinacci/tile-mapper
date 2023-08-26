import {Changed, EditableDocument, EditableMap} from "./model";
import {ListView} from "./ListView";
import React, {useContext, useEffect, useState} from "react";
import {DialogContext, HBox} from "josh_react_util";
import {NewMapDialog} from "./NewMapDialog";

function MapNameRenderer(props: {
    value: EditableMap,
    selected: any,
    setSelected: (value: any) => void
}) {
    return <div onClick={() => props.setSelected(props.value)}>
        {props.value.getName()}
    </div>
}

export function MapList(props:{
    editable: boolean,
    doc: EditableDocument,
    map: EditableMap,
    setMap: (s: EditableMap) => void
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
    map: EditableMap,
}) {
    const {map} = props
    const [name, setName] = useState(map.getName())
    useEffect(() => {
        setName(map.getName())
        let hand = () => setName(map.getName())
        map.addEventListener(Changed, hand)
        return () => map.removeEventListener(Changed, hand)
    }, [map]);

    return <div className={'pane'}>
        <header>map props</header>
        <ul className={'props-sheet'}>
            <li>
                <b>width</b>
                <label>{map.width()}</label>
            </li>
            <li>
                <b>height</b>
                <label>{map.height()}</label>
            </li>
            <li>
                <b>name</b>
                <input type={'text'}
                       value={name}
                       onChange={(e) => props.map.setName(e.target.value)}/>
            </li>
        </ul>
    </div>
}

