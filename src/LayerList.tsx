import {Size} from "josh_js_util"
import {DialogContext} from "josh_react_util"
import React, {useContext} from "react"

import {appendToList, PropsBase, useWatchProp} from "./base"
import {GameMap, MapLayerType, TileLayer} from "./datamodel"
import {ListView, ListViewDirection, ListViewRenderer} from "./ListView"
import {ResizeLayerDialog} from "./ResizeLayerDialog"

const LayerNameRenderer: ListViewRenderer<PropsBase<MapLayerType>> = (props: {
    value: PropsBase<MapLayerType>,
    selected: boolean
}) => {
    useWatchProp(props.value,'name')
    return <div className={'std-list-item'} style={{
        justifyContent:'space-between'
    }}><b>{props.value.getPropValue('name')}</b> <i>{props.value.getPropValue('type')}</i></div>
}


export function LayerList(props: {
    setSelectedLayer: (value: PropsBase<MapLayerType>) => void,
    map: GameMap,
    editable: boolean,
    layer: PropsBase<MapLayerType>
}) {

    const dm = useContext(DialogContext)
    useWatchProp(props.map,"layers")
    const add_tile_layer = () => {
        const layer = new TileLayer({name:'new tile layer', size: new Size(20,10), type:'tile-layer'})
        appendToList(props.map,"layers", layer)
    }
    const add_actor_layer = () => {

    }
    const delete_layer = () => {

    }
    const move_layer_up = () => {
        if(!props.layer) return
        let layers = props.map.getPropValue('layers') as PropsBase<MapLayerType>[]
        layers = layers.slice()
        const n = layers.indexOf(props.layer)
        if(n>= layers.length) return
        layers.splice(n,1)
        layers.splice(n+1,0,props.layer)
        props.map.setPropValue('layers',layers)
    }
    const move_layer_down = () => {
        if(!props.layer) return
        let layers = props.map.getPropValue('layers') as PropsBase<MapLayerType>[]
        layers = layers.slice()
        const n = layers.indexOf(props.layer)
        if(n<=0) return
        layers.splice(n,1)
        layers.splice(n-1,0,props.layer)
        props.map.setPropValue('layers',layers)

    }
    const resize = () => {
        if(props.layer instanceof  TileLayer) {}
        dm.show(<ResizeLayerDialog layer={props.layer}/>)
    }

    return <div className={'pane layer-list-view'}>
        <header>Layers</header>
        {props.editable &&
            <div className={'toolbar'}>
                <button onClick={add_tile_layer}>+ tile layer</button>
                <button onClick={add_actor_layer}>+ actor layer</button>
                <button onClick={delete_layer}>del layer</button>
                <button onClick={move_layer_up}>▼</button>
                <button onClick={move_layer_down}>▲</button>
                <button onClick={resize}>resize</button>
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
