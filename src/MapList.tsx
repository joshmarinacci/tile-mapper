import {EditableDocument, EditableMap, EditableSheet, EditableSprite} from "./model";
import {ListView} from "./ListView";
import React from "react";

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
    const add_map = () => {
        let map = new EditableMap()
        doc.addMap(map)
        setMap(map)
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
    return  <div className={'pane'}>
        <header>map props</header>
    </div>
}

export function MapEditor(props:{
    map:EditableMap,
    sheet:EditableSheet,
    tile:EditableSprite,
}) {
    return <div>map editor</div>
}
