import React from "react"

import {
  DeleteSelectedTileAction,
  DuplicateSelectedTileAction,
  FlipTileAroundHorizontalAction,
  FlipTileAroundVerticalAction,
} from "../actions/sheets"
import { MenuList, ToolbarActionButton } from "../common/common-components"
import { Sheet } from "../model/sheet"
import { Tile } from "../model/tile"
import { SparseGridModel } from "./TileGridView"

export function TilePopupMenu(props: { value: Tile; grid?: SparseGridModel<Tile>; sheet: Sheet }) {
  const { value, sheet } = props
  return (
    <MenuList>
      <ToolbarActionButton action={FlipTileAroundVerticalAction} />
      <ToolbarActionButton action={FlipTileAroundHorizontalAction} />
      {/*<button onClick={() => rotateTile90Clock(value)}> rotate 90 clock</button>*/}
      {/*<button onClick={() => rotateTile90CounterClock(value)}> rotate 90 counter-clock</button>*/}
      <ToolbarActionButton action={DeleteSelectedTileAction} />
      <ToolbarActionButton action={DuplicateSelectedTileAction} />
    </MenuList>
  )
}
