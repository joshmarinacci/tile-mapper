import React from "react"

import {PropsBase, useWatchProp} from "./base"
import {Layer2Type, Map2, Sheet2} from "./data2"
import {ListView, ListViewDirection, ListViewRenderer} from "./ListView"

const LayerNameRenderer: ListViewRenderer<PropsBase<Layer2Type>> = (props: {
    value: PropsBase<Layer2Type>,
    selected: boolean
}) => {
    useWatchProp(props.value,'name')
    return <div>Layer {props.value.getPropValue('name')}</div>
}

export function LayerList(props: {
    setSelectedLayer: (value: PropsBase<Layer2Type>) => void,
    map: Map2,
    editable: boolean,
    layer: PropsBase<Layer2Type>
}) {

    const add_tile_layer = () => {

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
