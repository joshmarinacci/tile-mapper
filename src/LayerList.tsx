import {Size} from "josh_js_util"
import {DialogContext} from "josh_react_util"
import React, {useContext} from "react"

import {appendToList, PropsBase, useWatchProp} from "./base"
import {ActorLayer, GameMap, MapLayerType, TileLayer} from "./datamodel"
import {ListView, ListViewDirection, ListViewOptions, ListViewRenderer} from "./ListView"
import {ResizeLayerDialog} from "./ResizeLayerDialog"

const LayerNameRenderer: ListViewRenderer<PropsBase<MapLayerType>> = (props: {
    value: PropsBase<MapLayerType>,
    selected: boolean,
    options:ListViewOptions,
}) => {
    useWatchProp(props.value,'name')
    useWatchProp(props.value,'visible')
    return <div className={'std-list-item'} style={{
        justifyContent:'space-between'
    }}>
        <b>{props.value.getPropValue('name')}</b>
        <i>{props.value.getPropValue('type')}</i>
        <b>{props.value.getPropValue('visible')?"visible":"hidden"}</b>
    </div>
}


export function LayerList(props: {
    setSelectedLayer: (value: PropsBase<MapLayerType>|undefined) => void,
    map: GameMap,
    editable: boolean,
    layer: PropsBase<MapLayerType>|undefined
}) {
    const {layer} = props
    const dm = useContext(DialogContext)
    useWatchProp(props.map,"layers")
    const add_tile_layer = () => {
        const layer = new TileLayer({name:'new tile layer', size: new Size(20,10), scrollSpeed: 1,visible: true,wrapping:false})
        appendToList(props.map,"layers", layer)
    }
    const add_actor_layer = () => {
        const layer = new ActorLayer({name:'new actor layer', visible:true,blocking:true})
        appendToList(props.map, 'layers',layer)
    }
    const delete_layer = () => {
        if(!layer) return
        let layers = props.map.getPropValue('layers') as PropsBase<MapLayerType>[]
        layers = layers.slice()
        const n = layers.indexOf(layer)
        if(n >= 0) {
            layers.splice(n,1)
        }
        props.map.setPropValue('layers',layers)
    }
    const move_layer_up = () => {
        if(!layer) return
        let layers = props.map.getPropValue('layers') as PropsBase<MapLayerType>[]
        layers = layers.slice()
        const n = layers.indexOf(layer)
        if(n>= layers.length) return
        layers.splice(n,1)
        layers.splice(n+1,0,layer)
        props.map.setPropValue('layers',layers)
    }
    const move_layer_down = () => {
        if(!layer) return
        let layers = props.map.getPropValue('layers') as PropsBase<MapLayerType>[]
        layers = layers.slice()
        const n = layers.indexOf(layer)
        if(n<=0) return
        layers.splice(n,1)
        layers.splice(n-1,0,layer)
        props.map.setPropValue('layers',layers)

    }
    const resize = () => {
        if(layer instanceof  TileLayer) dm.show(<ResizeLayerDialog layer={layer}/>)
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
        <ListView selected={layer}
                  setSelected={props.setSelectedLayer}
                  renderer={LayerNameRenderer}
                  data={props.map.getPropValue('layers')}
                  direction={ListViewDirection.VerticalFill}
                  className={'sheet-list'}
                  options={{}}
        />
    </div>
}
