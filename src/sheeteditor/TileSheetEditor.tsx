import "./TileSheetEditor.css"

import { ArrayGrid } from "josh_js_util"
import { VBox } from "josh_react_util"
import React, { useContext, useEffect, useState } from "react"

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
  const state = useContext(StateContext)
  const path = state.getSelectionPath()
  const selection = path.start()
  const [maparray] = useState(() => new ArrayGrid<Tile>(20, 20))
  return (
    <>
      <div className={"tool-column"}>
        {sheet && (
          <Pane collapsable={true} title={"Tile Sheet"}>
            <TileListView editable={true} sheet={sheet} />
          </Pane>
        )}
        {selection instanceof Tile && (
          <Pane collapsable={true} title={"Scratch"}>
            <TestMap tile={selection as Tile} mapArray={maparray} />
          </Pane>
        )}
      </div>
      <div className={"editor-view"}>
        <VBox>
          {selection instanceof Tile && (
            <ImageEditorCanvas
              image={(selection as Tile).getPropValue("data")}
              layer={(selection as Tile).getPropValue("data").layers()[0]}
              frame={(selection as Tile).getPropValue("data").frames()[0]}
            />
          )}
          {!(selection as Tile) && <div>no tile selected</div>}
        </VBox>
      </div>
    </>
  )
}
