import "./TileSheetEditor.css"

import {ArrayGrid} from "josh_js_util"
import {VBox} from "josh_react_util"
import React, {useContext, useEffect, useState} from "react"

import {DocContext, Pane} from "../common/common-components"
import {PaletteColorPickerPane} from "../common/Palette"
import {PropSheet} from "../common/propsheet"
import {Sheet, Tile} from "../model/datamodel"
import {GlobalState} from "../state"
import {TestMap} from "../testeditor/TestMap"
import {PixelGridEditor} from "./PixelGridEditor"
import {TileListView} from "./TileListView"

export function TileSheetEditor(props: {
    sheet: Sheet,
    state: GlobalState,
}) {
    const {sheet} = props
    const doc = useContext(DocContext)
    const palette = doc.getPropValue('palette')
    const [drawColor, setDrawColor] = useState<string>(palette.colors[0])
    const [tile, setTile] = useState<Tile | undefined>(undefined)
    const [maparray] = useState(() => new ArrayGrid<Tile>(20, 20))
    useEffect(() => {
        const tiles = sheet.getPropValue('tiles')
        setTile(tiles.length > 0 ? tiles[0] : undefined)
    }, [sheet])

    return (<div className={'tile-sheet-editor'}>
        <div className={'scrolling-column'}>
            {sheet && <Pane collapsable={true} title={'Tile Sheet'}>
                <TileListView editable={true} sheet={sheet} tile={tile} setTile={setTile}
                              palette={palette}/>
            </Pane>}
            {tile && <PropSheet target={tile} title={'Tile Info'}/>}
            {tile && <Pane collapsable={true} title={'Text'}>
                <TestMap tile={tile} mapArray={maparray} palette={palette}/>
            </Pane>}
        </div>
        <VBox>
            <PaletteColorPickerPane drawColor={drawColor} setDrawColor={setDrawColor}
                                    palette={palette}/>
            {tile && <PixelGridEditor
                selectedColor={palette.colors.indexOf(drawColor)}
                setSelectedColor={(n) => setDrawColor(palette.colors[n])}
                tile={tile} palette={palette}/>}
            {!tile && <div>no tile selected</div>}
        </VBox>
    </div>)
}
