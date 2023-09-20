import "./TileSheetEditor.css"

import {ArrayGrid} from "josh_js_util"
import {VBox} from "josh_react_util"
import React, {useState} from "react"

import {Doc2, Sheet2, Tile2} from "./data2"
import {PaletteColorPickerPane} from "./Palette"
import {PixelGridEditor} from "./PixelGridEditor"
import {PropSheet} from "./propsheet"
import {GlobalState} from "./state"
import {TestMap} from "./TestMap"
import {TileListView} from "./TileListView"

export function TileSheetEditor(props: {
    state: GlobalState,
    doc: Doc2
}) {
    const {doc} = props
    // const [sheets, setSheets] = useState<EditableSheet[]>(doc.getSheets())
    const palette: string[] = doc.getPropValue('palette') as string[]
    const [drawColor, setDrawColor] = useState<string>(palette[0])
    const [sheet, setSheet] = useState(doc.getPropValue('sheets')[0] as Sheet2)
    const [tile, setTile] = useState<Tile2 | null>(sheet.getPropValue('tiles')[0])
    const [maparray] = useState(() => new ArrayGrid<Tile2>(20, 20))

    return (<div className={'tile-sheet-editor'}>
        <VBox>
            {sheet && <TileListView
                editable={true}
                sheet={sheet}
                tile={tile}
                setTile={(t: Tile2) => setTile(t)}
                palette={palette}/>}
            <div className={'pane'}>
                <header>Tile Info</header>
                {tile && <PropSheet target={tile}/>}
            </div>
        </VBox>
        <VBox>
            <PaletteColorPickerPane drawColor={drawColor} setDrawColor={setDrawColor}
                                    palette={palette}/>
            {tile && <PixelGridEditor
                selectedColor={palette.indexOf(drawColor)}
                setSelectedColor={(n) => setDrawColor(palette[n])}
                image={tile} palette={palette}/>}
            {!tile && <div>no tile selected</div>}
            {tile &&
                <div className={'pane'}>
                    <header>Test</header>
                    <TestMap tile={tile} mapArray={maparray}/>
                </div>
            }
        </VBox>
    </div>)
}
