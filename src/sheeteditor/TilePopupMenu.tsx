import React from "react"

import {
  deleteTile,
  duplicate_tile,
  flipTileAroundHorizontal,
  flipTileAroundVertical,
  rotateTile90Clock,
  rotateTile90CounterClock,
} from "../actions/actions"
import { MenuList } from "../common/common-components"
import { Sheet, Tile } from "../model/datamodel"
import { SparseGridModel } from "./TileGridView"

export function TilePopupMenu(props: {
  value: Tile
  grid?: SparseGridModel<Tile>
  sheet: Sheet
}) {
  const { value, sheet } = props
  return (
    <MenuList>
      <button onClick={() => flipTileAroundVertical(value)}>
        {" "}
        flip left / right
      </button>
      <button onClick={() => flipTileAroundHorizontal(value)}>
        {" "}
        flip top / bottom
      </button>
      <button onClick={() => rotateTile90Clock(value)}> rotate 90 clock</button>
      <button onClick={() => rotateTile90CounterClock(value)}>
        {" "}
        rotate 90 counter-clock
      </button>
      <button onClick={() => duplicate_tile(sheet, value)}>duplicate</button>
      <button onClick={() => deleteTile(sheet, value)}>delete</button>
    </MenuList>
  )
}
