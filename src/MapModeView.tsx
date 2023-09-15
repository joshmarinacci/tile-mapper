import {HBox} from "josh_react_util"
import React, {useState} from "react"

import {MapImpl} from "./defs"
import {MapEditor} from "./MapEditor"
import {MapList} from "./MapList"
import {EditableDocument,  EditableSheet, EditableSprite} from "./model"
import {PropSheet} from "./propsheet"
import {SheetList} from "./SheetList"
import {GlobalState} from "./state"
import {TileSheetView} from "./TileSheetView"

export function MapModeView(props: {
    state: GlobalState,
    doc: EditableDocument
}) {
    const {doc} = props
    const [selectedMap, setSelectedMap] = useState<MapImpl>(doc.getMaps()[0])
    const [selectedSheet, setSelectedSheet] = useState<EditableSheet>(doc.getSheets()[0])
    const [selectedTile, setSelectedTile] = useState<EditableSprite>(doc.getSheets()[0].getImages()[0])

    return <>
        <HBox>
            <MapList map={selectedMap} setMap={setSelectedMap} doc={doc} editable={true}/>
            {!selectedMap && <div>no map selected</div>}
            {selectedMap &&<div className={'pane'}>
                <header>map props</header>
                <PropSheet target={selectedMap}/>
            </div>}
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
