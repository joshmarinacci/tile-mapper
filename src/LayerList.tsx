import {DialogContext} from "josh_react_util"
import React, {useContext} from "react"

import {
    add_actor_layer,
    add_tile_layer,
    delete_layer,
    move_layer_down,
    move_layer_up
} from "./actions"
import {PropsBase, useWatchProp} from "./base"
import {GameMap, MapLayerType, TileLayer} from "./datamodel"
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
    const resize = () => {
        if(layer instanceof  TileLayer) dm.show(<ResizeLayerDialog layer={layer}/>)
    }

    return <div className={'pane layer-list-view'}>
        <header>Layers</header>
        {props.editable &&
            <div className={'toolbar'}>
                <button onClick={()=>add_tile_layer(props.map)}>+ tile layer</button>
                <button onClick={()=>add_actor_layer(props.map)}>+ actor layer</button>
                <button onClick={()=>delete_layer(layer,props.map)}>del layer</button>
                <button onClick={()=>move_layer_up(layer,props.map)}>▼</button>
                <button onClick={()=>move_layer_down(layer,props.map)}>▲</button>
                <button onClick={()=>resize()}>resize</button>
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
