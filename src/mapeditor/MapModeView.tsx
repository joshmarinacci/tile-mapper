import "./MapEditor.css"

import React, { useContext, useState } from "react"

import { PropsBase } from "../model/base"
import { DocContext, StateContext } from "../model/contexts"
import { GameMap, MapLayerType, Sheet, Tile } from "../model/datamodel"
import { CompactSheetAndTileSelector } from "../sheeteditor/TileListView"
import { LayerEditor } from "./LayerEditor"
import { LayerList } from "./LayerList"

export function MapModeView(props: { map: GameMap }) {
  const doc = useContext(DocContext)
  const state = useContext(StateContext)
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
          setSelectedLayer={(l) => {
            setSelectedLayer(l)
            state.setSelectionTarget(l)
          }}
        />
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
