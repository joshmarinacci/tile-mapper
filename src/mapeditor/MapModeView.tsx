import "./MapEditor.css"

import React, { useContext, useState } from "react"

import { PropsBase } from "../model/base"
import { DocContext } from "../model/contexts"
import { GameMap, MapLayerType, Sheet, Tile } from "../model/datamodel"
import { PropSheet } from "../propsheet/propsheet"
import { CompactSheetAndTileSelector } from "../sheeteditor/TileListView"
import { LayerEditor } from "./LayerEditor"
import { LayerList } from "./LayerList"

export function MapModeView(props: { map: GameMap }) {
  const doc = useContext(DocContext)
  const selectedMap = props.map
  const layers = selectedMap.getPropValue("layers")
  const sheets = doc.getPropValue("sheets") as Sheet[]
  const [selectedTile, setSelectedTile] = useState<Tile | undefined>(
    sheets[0].getPropValue("tiles")[0],
  )
  const [selectedLayer, setSelectedLayer] = useState<PropsBase<MapLayerType> | undefined>(layers[0])
  return (
    <>
      <div className={"tool-column"}>
        {!selectedMap && <div>no map selected</div>}
        <CompactSheetAndTileSelector
          selectedTile={selectedTile}
          setSelectedTile={setSelectedTile}
        />
        <LayerList
          key={"layer-list"}
          editable={true}
          map={selectedMap}
          layer={selectedLayer}
          setSelectedLayer={setSelectedLayer}
        />
        <PropSheet target={selectedLayer} title={"Layer Info"} collapsable />
      </div>
      <div className={"editor-view"}>
        <LayerEditor
          key={"layer-editor"}
          map={props.map}
          layer={selectedLayer}
          tile={selectedTile}
          setSelectedTile={setSelectedTile}
        />
      </div>
    </>
  )
}
