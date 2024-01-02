import "./TileSheetEditor.css"

import { ArrayGrid } from "josh_js_util"
import { VBox } from "josh_react_util"
import React, { useContext, useState } from "react"

import { Pane } from "../common/common-components"
import { ImageEditorCanvas } from "../imageeditor/ImageEditorCanvas"
import { PropsBase, useWatchProp } from "../model/base"
import { StateContext } from "../model/contexts"
import { Sheet } from "../model/sheet"
import { Tile } from "../model/tile"
import { TestMap } from "./TestMap"
import { TileListView } from "./TileListView"

export function TileSheetEditor(props: { sheet: Sheet }) {
  const { sheet } = props
  const [selectedTile, setSelectedTile] = useState<Tile | undefined>(undefined)
  const [maparray] = useState(() => new ArrayGrid<Tile>(20, 20))
  const state = useContext(StateContext)
  useWatchProp(state, "selection", () => {
    const start = state.getSelectionPath().start()
    if (start instanceof Tile) {
      setSelectedTile(start)
    }
  })
  return (
    <>
      <div className={"tool-column"}>
        {sheet && (
          <Pane collapsable={true} title={"Tile Sheet"}>
            <TileListView
              editable={true}
              sheet={sheet}
              tile={selectedTile}
              setSelectedTile={(tile) => {
                setSelectedTile(tile)
                state.setSelectionTarget(tile as unknown as PropsBase<unknown>)
              }}
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
