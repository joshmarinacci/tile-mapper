import React from "react"

import {
  DeleteSelectedTileAction,
  DuplicateSelectedTileAction,
  FlipTileAroundHorizontalAction,
  FlipTileAroundVerticalAction,
  RotateTile90ClockAction,
  RotateTile90CounterClockAction,
} from "../actions/sheets"
import { MenuList, ToolbarActionButton } from "../common/common-components"
import { Sheet } from "../model/sheet"
import { Tile } from "../model/tile"
import { SparseGridModel } from "./TileGridView"

export function TilePopupMenu(props: { value: Tile; grid?: SparseGridModel<Tile>; sheet: Sheet }) {
  return (
    <MenuList>
      <ToolbarActionButton action={FlipTileAroundVerticalAction} />
      <ToolbarActionButton action={FlipTileAroundHorizontalAction} />
      <ToolbarActionButton action={RotateTile90ClockAction} />
      <ToolbarActionButton action={RotateTile90CounterClockAction} />
      <ToolbarActionButton action={DeleteSelectedTileAction} />
      <ToolbarActionButton action={DuplicateSelectedTileAction} />
    </MenuList>
  )
}
