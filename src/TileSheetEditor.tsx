import "./TileSheetEditor.css"

import {ArrayGrid} from "josh_js_util"
import {VBox} from "josh_react_util"
import React, {useEffect, useState} from "react"

import {Doc2, Sheet2, Tile2} from "./datamodel"
import {PaletteColorPickerPane} from "./Palette"
import {PixelGridEditor} from "./PixelGridEditor"
import {PropSheet} from "./propsheet"
import {GlobalState} from "./state"
import {TestMap} from "./TestMap"
import {TileListView} from "./TileListView"

export function TileSheetEditor(props: {
    sheet: Sheet2,
    state: GlobalState,
    doc: Doc2
}) {
    const {doc, state, sheet} = props
    const palette: string[] = doc.getPropValue('palette') as string[]
    const [drawColor, setDrawColor] = useState<string>(palette[0])
    const [tile, setTile] = useState<Tile2 | null>(null)
    const [maparray] = useState(() => new ArrayGrid<Tile2>(20, 20))
    useEffect(() => {
        const tiles = sheet.getPropValue('tiles')
        setTile(tiles.length > 0?tiles[0]:null)
    }, [sheet])

    return (<div className={'tile-sheet-editor'}>
        <VBox>
            {sheet && <TileListView editable={true} sheet={sheet} tile={tile} setTile={setTile}  palette={palette}/>}
            {tile && <PropSheet target={tile} title={'Tile Info'}/>}
        </VBox>
        <VBox>
            <PaletteColorPickerPane drawColor={drawColor} setDrawColor={setDrawColor}
                                    palette={palette}/>
            {tile && <PixelGridEditor
                selectedColor={palette.indexOf(drawColor)}
                setSelectedColor={(n) => setDrawColor(palette[n])}
                image={tile} palette={palette}/>}
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
