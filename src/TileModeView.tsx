import {ArrayGrid} from "josh_js_util"
import {HBox} from "josh_react_util"
import React, {useState} from "react"

import {EditableDocument, EditableSheet, EditableSprite} from "./model"
import {PaletteColorPickerPane} from "./Palette"
import {PixelGridEditor} from "./PixelGridEditor"
import {PropSheet} from "./propsheet"
import {SheetList} from "./SheetList"
import {GlobalState} from "./state"
import {TestMap} from "./TestMap"
import {TileSheetView} from "./TileSheetView"

export function TileModeView(props: {state:GlobalState, doc: EditableDocument }) {
    const {doc} = props
    // const [sheets, setSheets] = useState<EditableSheet[]>(doc.getSheets())
    const [drawColor, setDrawColor] = useState<string>(doc.getPalette()[0])
    const [sheet, setSheet] = useState<EditableSheet>(doc.getSheets()[0])
    const [tile, setTile] = useState<EditableSprite>(doc.getSheets()[0].getImages()[0])
    const [maparray] = useState(() => new ArrayGrid<EditableSprite>(20, 20))

    return (<>
        <HBox>
            <SheetList editable={true} sheet={sheet} setSheet={setSheet} doc={doc}/>
            <div className={'pane'}>
                <header>Tile Sheet</header>
                {sheet && <TileSheetView
                    editable={true}
                    sheet={sheet}
                    tile={tile}
                    setTile={(t: EditableSprite) => setTile(t)}
                    palette={doc.getPalette()}/>}
            </div>
            <div className={'pane'}>
                <header>Tile Info</header>
                {tile && <PropSheet target={tile}/>}
            </div>
        </HBox>
        <HBox>
            <PaletteColorPickerPane drawColor={drawColor} setDrawColor={setDrawColor}
                                    palette={doc.getPalette()}/>
            {tile && <PixelGridEditor
                selectedColor={doc.getPalette().indexOf(drawColor)}
                setSelectedColor={(n) => setDrawColor(doc.getPalette()[n])}
                image={tile} palette={doc.getPalette()}/>}
            {!tile && <div>no tile selected</div>}
            <div className={'pane'}>
                <header>Test</header>
                <TestMap tile={tile} mapArray={maparray}/>
            </div>
        </HBox>
    </>)
}
