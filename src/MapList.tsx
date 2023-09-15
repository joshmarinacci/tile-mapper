import {DialogContext} from "josh_react_util"
import React, {useContext} from "react"

import {DocModel, MapModel} from "./defs"
import {ListView, ListViewRenderer} from "./ListView"
import {NewMapDialog} from "./NewMapDialog"

const MapNameRenderer:ListViewRenderer<MapModel> = (props:{value:MapModel, selected:boolean}) => {
    return <div>
        {props.value.getPropValue('name') as string}
    </div>
}

export function MapList(props:{
    editable: boolean,
    doc: DocModel,
    map: MapModel,
    setMap: (s: MapModel) => void
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

