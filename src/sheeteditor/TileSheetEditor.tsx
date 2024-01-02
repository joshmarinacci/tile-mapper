import "./TileSheetEditor.css"

import { ArrayGrid } from "josh_js_util"
import { VBox } from "josh_react_util"
import React, { useState } from "react"

import { Pane } from "../common/common-components"
import { ImageEditorCanvas } from "../imageeditor/ImageEditorCanvas"
import { Sheet } from "../model/sheet"
import { Tile } from "../model/tile"
import { TestMap } from "./TestMap"
import { TileListView } from "./TileListView"

export function TileSheetEditor(props: { sheet: Sheet }) {
  const { sheet } = props
  const [selectedTile, setSelectedTile] = useState<Tile | undefined>(undefined)
  const [maparray] = useState(() => new ArrayGrid<Tile>(20, 20))
  return (
    <>
      <div className={"tool-column"}>
        {sheet && (
          <Pane collapsable={true} title={"Tile Sheet"}>
            <TileListView
              editable={true}
              sheet={sheet}
              tile={selectedTile}
              setSelectedTile={setSelectedTile}
            />
          </Pane>
        )}
        {
          <Pane collapsable={true} title={"Scratch"}>
            <TestMap tile={selectedTile} mapArray={maparray} />
          </Pane>
        }
      </div>
      <div className={"editor-view"}>
        <VBox>
          {selectedTile && (
            <ImageEditorCanvas
              image={(selectedTile as Tile).getPropValue("data")}
              layer={(selectedTile as Tile).getPropValue("data").layers()[0]}
              frame={(selectedTile as Tile).getPropValue("data").frames()[0]}
            />
          )}
          {!(selectedTile as Tile) && <div>no tile selected</div>}
        </VBox>
      </div>
    </>
  )
}
