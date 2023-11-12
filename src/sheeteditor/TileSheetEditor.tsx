import "./TileSheetEditor.css"

import { ArrayGrid } from "josh_js_util"
import { VBox } from "josh_react_util"
import React, { useContext, useEffect, useState } from "react"

import { Pane } from "../common/common-components"
import { PaletteColorPickerPane } from "../common/Palette"
import { useWatchProp } from "../model/base"
import { DocContext, StateContext } from "../model/contexts"
import { Sheet } from "../model/sheet"
import { Tile } from "../model/tile"
import { PixelGridEditor } from "./PixelGridEditor"
import { TestMap } from "./TestMap"
import { TileListView } from "./TileListView"

export function TileSheetEditor(props: { sheet: Sheet }) {
  const { sheet } = props
  const doc = useContext(DocContext)
  const state = useContext(StateContext)
  const palette = doc.getPropValue("palette")
  const [drawColor, setDrawColor] = useState<string>(palette.colors[0])
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
                sheet.setPropValue("selectedTile", tile)
                state.setSelectionTarget(tile)
              }}
              palette={palette}
            />
          </Pane>
        )}
        {tile && (
          <Pane collapsable={true} title={"Scratch"}>
            <TestMap tile={tile} mapArray={maparray} palette={palette} />
          </Pane>
        )}
      </div>
      <div className={"editor-view"}>
        <VBox>
          <PaletteColorPickerPane
            drawColor={drawColor}
            setDrawColor={setDrawColor}
            palette={palette}
          />
          {tile && (
            <PixelGridEditor
              selectedColor={palette.colors.indexOf(drawColor)}
              setSelectedColor={(n) => setDrawColor(palette.colors[n])}
              tile={tile}
              palette={palette}
            />
          )}
          {!tile && <div>no tile selected</div>}
        </VBox>
      </div>
    </>
  )
}
