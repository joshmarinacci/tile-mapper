import "./MapEditor.css"

import {HBox} from "josh_react_util"
import React, {useState} from "react"

import {GameDoc, GameMap, Sheet, Tile} from "./datamodel"
import {LayerEditor} from "./LayerEditor"
import {LayerList} from "./LayerList"
import {PropSheet} from "./propsheet"
import {GlobalState} from "./state"
import {CompactSheetAndTileSelector} from "./TileListView"

export function MapModeView(props: {
    state: GlobalState,
    doc: GameDoc,
    map: GameMap,
}) {
    const {doc} = props
    const selectedMap = props.map
    const layers = selectedMap.getPropValue('layers')
    const sheets = doc.getPropValue('sheets') as Sheet[]
    const [selectedTile, setSelectedTile] = useState<Tile>(sheets[0].getPropValue('tiles')[0])
    const [selectedLayer, setSelectedLayer] = useState(layers[0])


    return <div className={'map-editor'}>
        <HBox>
            {!selectedMap && <div>no map selected</div>}
            <CompactSheetAndTileSelector doc={doc} selectedTile={selectedTile} setSelectedTile={setSelectedTile} />
            <LayerList
                key={'layer-list'}
                editable={true}
                map={selectedMap}
                layer={selectedLayer}
                setSelectedLayer={setSelectedLayer}
            />
            <PropSheet target={selectedLayer} title={'Layer Info'}/>
        </HBox>
        <HBox>
            <LayerEditor
                key={'layer-editor'}
                doc={doc}
                map={props.map}
                layer={selectedLayer}
                tile={selectedTile}
                setSelectedTile={setSelectedTile}
            />
        </HBox>
    </div>
}
