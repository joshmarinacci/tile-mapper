import {EditableDocument, EditableSheet, EditableSprite} from "./model";
import React, {useState} from "react";
import {ArrayGrid} from "josh_js_util";
import {SheetList} from "./SheetList";
import {TileSheetView} from "./TileSheetView";
import {TileProperties} from "./TileProperties";
import {PaletteColorPickerPane} from "./Palette";
import {PixelGridEditor} from "./PixelGridEditor";
import {TestMap} from "./TestMap";

export function TileModeView(props: { doc: EditableDocument }) {
    const {doc} = props
    const [sheets, setSheets] = useState<EditableSheet[]>(doc.getSheets())
    const [drawColor, setDrawColor] = useState<string>(doc.getPalette()[0])
    const [sheet, setSheet] = useState<EditableSheet>(doc.getSheets()[0])
    const [tile, setTile] = useState<EditableSprite>(doc.getSheets()[0].getImages()[0])
    const [maparray] = useState(() => new ArrayGrid<EditableSprite>(20, 20))

    return (<div className={'main'}>
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
            {tile && <TileProperties tile={tile}/>}
        </div>
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
    </div>)
}
