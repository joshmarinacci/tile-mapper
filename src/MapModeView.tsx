import "./MapEditor.css"

import {HBox} from "josh_react_util"
import React, {useState} from "react"

import {Doc2, Map2, Sheet2, Tile2} from "./data2"
import {LayerEditor} from "./LayerEditor"
import {ListView, ListViewDirection, ListViewRenderer} from "./ListView"
import {PropSheet} from "./propsheet"
import {SheetList} from "./SheetList"
import {GlobalState} from "./state"
import {TileListView} from "./TileListView"

const LayerNameRenderer: ListViewRenderer<Sheet2> = (props: {
    value: Sheet2,
    selected: boolean
}) => {
    return <div>Layer {props.value.getPropValue('name')}</div>
}

function LayerList(props: {
    setSelectedLayer: (value: any) => void,
    map: Map2,
    editable: boolean,
    layer: any
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

export function MapModeView(props: {
    state: GlobalState,
    doc: Doc2,
    map: Map2,
}) {
    const {doc} = props
    const selectedMap = props.map
    const layers = selectedMap.getPropValue('layers')
    const sheets = doc.getPropValue('sheets') as Sheet2[]
    const [selectedSheet, setSelectedSheet] = useState<Sheet2>(sheets[0])
    const [selectedTile, setSelectedTile] = useState<Tile2>(sheets[0].getPropValue('tiles')[0])
    const [selectedLayer, setSelectedLayer] = useState(layers[0])


    return <div className={'map-editor'}>
        <HBox>
            {!selectedMap && <div>no map selected</div>}
            <SheetList
                editable={false}
                sheet={selectedSheet}
                setSheet={setSelectedSheet}
                doc={doc}/>
            {selectedSheet && <TileListView
                sheet={selectedSheet}
                tile={selectedTile}
                editable={false}
                setTile={(t: Tile2) => setSelectedTile(t)}
                palette={doc.getPropValue('palette')}/>}
        </HBox>
        <HBox>
            <LayerList
                key={'layer-list'}
                editable={true}
                map={selectedMap}
                layer={selectedLayer}
                setSelectedLayer={setSelectedLayer}
            />
            <PropSheet target={selectedLayer}/>
            <LayerEditor
                key={'layer-editor'}
                doc={doc}
                map={props.map}
                layer={selectedLayer}
                sheet={selectedSheet}
                tile={selectedTile}
                setSelectedTile={setSelectedTile}
            />
        </HBox>
    </div>
}
