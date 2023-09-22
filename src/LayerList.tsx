import {Size} from "josh_js_util"
import React from "react"

import {appendToList, PropsBase, useWatchProp} from "./base"
import {GameMap, Layer2Type, TileLayer} from "./datamodel"
import {TilemapLayer} from "./engine/tilemaplayer"
import {ListView, ListViewDirection, ListViewRenderer} from "./ListView"

const LayerNameRenderer: ListViewRenderer<PropsBase<Layer2Type>> = (props: {
    value: PropsBase<Layer2Type>,
    selected: boolean
}) => {
    useWatchProp(props.value,'name')
    return <div className={'std-list-item'} style={{
        justifyContent:'space-between'
    }}><b>{props.value.getPropValue('name')}</b> <i>{props.value.getPropValue('type')}</i></div>
}

export function LayerList(props: {
    setSelectedLayer: (value: PropsBase<Layer2Type>) => void,
    map: GameMap,
    editable: boolean,
    layer: PropsBase<Layer2Type>
}) {

    useWatchProp(props.map,"layers")
    const add_tile_layer = () => {
        const layer = new TileLayer({name:'new tile layer', size: new Size(20,10), type:'tile-layer'})
        appendToList(props.map,"layers", layer)
    }
    const add_actor_layer = () => {

    }
    const delete_layer = () => {

    }

    return <div className={'pane layer-list-view'}>
        <header>Layers</header>
        {props.editable &&
            <div className={'toolbar'}>
                <button onClick={add_tile_layer}>add tile layer</button>
                <button onClick={add_actor_layer}>add actor layer</button>
                <button onClick={delete_layer}>del layer</button>
            </div>}
        <ListView selected={props.layer}
                  setSelected={props.setSelectedLayer}
                  renderer={LayerNameRenderer}
                  data={props.map.getPropValue('layers')}
                  style={{}}
                  direction={ListViewDirection.VerticalFill}
                  className={'sheet-list'}/>
    </div>
}
