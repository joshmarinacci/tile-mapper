import {HBox} from "josh_react_util"
import React, {useState} from "react"

import {MapEditor} from "./MapEditor"
import {MapList, MapProps} from "./MapList"
import {EditableDocument, EditableMap, EditableSheet, EditableSprite} from "./model"
import {SheetList} from "./SheetList"
import {TileSheetView} from "./TileSheetView"

export function MapModeView(props: {
    doc: EditableDocument
}) {
    const {doc} = props
    const [selectedMap, setSelectedMap] = useState<EditableMap>(doc.getMaps()[0])
    const [selectedSheet, setSelectedSheet] = useState<EditableSheet>(doc.getSheets()[0])
    const [selectedTile, setSelectedTile] = useState<EditableSprite>(doc.getSheets()[0].getImages()[0])

    return <>
        <HBox>
            <MapList map={selectedMap} setMap={setSelectedMap} doc={doc} editable={true}/>
            {!selectedMap && <div>no map selected</div>}
            {selectedMap && <MapProps doc={doc} map={selectedMap}/>}
            <SheetList
                editable={false}
                sheet={selectedSheet}
                setSheet={setSelectedSheet}
                doc={doc}/>
            <div className={'pane'}>
                <header>Tile Sheet</header>
                {selectedSheet && <TileSheetView
                    sheet={selectedSheet}
                    tile={selectedTile}
                    editable={false}
                    setTile={(t: EditableSprite) => setSelectedTile(t)}
                    palette={doc.getPalette()}/>}
            </div>
        </HBox>
        <MapEditor
            doc={doc}
            map={selectedMap}
            sheet={selectedSheet}
            tile={selectedTile}
            setSelectedTile={setSelectedTile}
        />
    </>
}
