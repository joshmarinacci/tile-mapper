import "./TileSheetEditor.css"

import {ArrayGrid} from "josh_js_util"
import {VBox} from "josh_react_util"
import React, {useContext, useEffect, useState} from "react"

import {DocContext, Pane} from "./common-components"
import {Sheet, Tile} from "./datamodel"
import {PaletteColorPickerPane} from "./Palette"
import {PixelGridEditor} from "./PixelGridEditor"
import {PropSheet} from "./propsheet"
import {GlobalState} from "./state"
import {TestMap} from "./TestMap"
import {TileListView} from "./TileListView"

export function TileSheetEditor(props: {
    sheet: Sheet,
    state: GlobalState,
}) {
    const {sheet} = props
    const doc = useContext(DocContext)
    const palette: string[] = doc.getPropValue('palette') as string[]
    const [drawColor, setDrawColor] = useState<string>(palette[0])
    const [tile, setTile] = useState<Tile | undefined>(undefined)
    const [maparray] = useState(() => new ArrayGrid<Tile>(20, 20))
    useEffect(() => {
        const tiles = sheet.getPropValue('tiles')
        setTile(tiles.length > 0?tiles[0]:undefined)
    }, [sheet])

    return (<div className={'tile-sheet-editor'}>
        <VBox>
            {sheet && <Pane>
                <header>Tile Sheet</header>
                <TileListView editable={true} sheet={sheet} tile={tile} setTile={setTile}  palette={palette}/>
            </Pane>}
            {tile && <PropSheet target={tile} title={'Tile Info'}/>}
        </VBox>
        <VBox>
            <PaletteColorPickerPane drawColor={drawColor} setDrawColor={setDrawColor}
                                    palette={palette}/>
            {tile && <PixelGridEditor
                selectedColor={palette.indexOf(drawColor)}
                setSelectedColor={(n) => setDrawColor(palette[n])}
                tile={tile} palette={palette}/>}
            {!tile && <div>no tile selected</div>}
        </VBox>
        {tile &&
            <div className={'pane'} style={{ maxWidth:'unset' }}>
                <header>Test</header>
                <TestMap tile={tile} mapArray={maparray}/>
            </div>
        }
    </div>)
}
