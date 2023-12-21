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
  const tile = sheet.getPropValue("selectedTile")
  const [maparray] = useState(() => new ArrayGrid<Tile>(20, 20))

  useEffect(() => {
    const tiles = sheet.getPropValue("tiles")
    sheet.setPropValue("selectedTile", tiles.length > 0 ? tiles[0] : undefined)
  }, [sheet])
  useWatchProp(sheet, "selectedTile")

  return (
    <>
      <div className={"tool-column"}>
        {sheet && (
          <Pane collapsable={true} title={"Tile Sheet"}>
            <TileListView
              editable={true}
              sheet={sheet}
              tile={tile}
              setTile={(tile) => {
                if (tile) {
                  sheet.setPropValue("selectedTile", tile)
                  state.setSelectionTarget(tile as unknown as PropsBase<unknown>)
                }
              }}
            />
          </Pane>
        )}
        {tile && (
          <Pane collapsable={true} title={"Scratch"}>
            <TestMap tile={tile} mapArray={maparray} />
          </Pane>
        )}
      </div>
      <div className={"editor-view"}>
        <VBox>
          {tile && (
            <ImageEditorCanvas
              image={tile.getPropValue("data")}
              layer={tile.getPropValue("data").layers()[0]}
              frame={tile.getPropValue("data").frames()[0]}
            />
          )}
          {!tile && <div>no tile selected</div>}
        </VBox>
      </div>
    </>
  )
}
