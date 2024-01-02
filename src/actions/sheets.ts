import { ArrayGrid, Point } from "josh_js_util"
import { canvas_to_blob, forceDownloadBlob } from "josh_web_util"

import { canvas_to_bmp, ImagePalette, sheet_to_canvas } from "../common/common"
import { Icons } from "../common/icons"
import { PropsBase, removeFromList } from "../model/base"
import { Sheet } from "../model/sheet"
import { Tile } from "../model/tile"
import { SimpleMenuAction } from "./actions"

export const DeleteSheetAction: SimpleMenuAction = {
  type: "simple",
  title: "delete sheet",
  perform: async (state) => {
    const sel = state.getPropValue("selection")
    if (sel instanceof Sheet) {
      removeFromList(state.getPropValue("doc"), "sheets", sel as Sheet)
      state.clearSelection()
    }
  },
}
export const ExportSheetToPNG: SimpleMenuAction = {
  type: "simple",
  title: "export to PNG",
  perform: async (state) => {
    const sheet = state.getPropValue("selection") as Sheet
    const palette = state.getPropValue("doc").getPropValue("palette")
    const canvas = sheet_to_canvas(sheet, palette)
    const blob = await canvas_to_blob(canvas)
    forceDownloadBlob(sheet.getPropValue("name") + ".png", blob)
  },
}
export const export_bmp = (sheet: Sheet, palette: ImagePalette) => {
  const canvas = sheet_to_canvas(sheet, palette)
  const rawData = canvas_to_bmp(canvas, palette)
  const blob = new Blob([rawData.data], { type: "image/bmp" })
  forceDownloadBlob(`${sheet.getPropValue("name")}.bmp`, blob)
}

export function deleteTile(sheet: Sheet, tile: Tile) {
  sheet.removeTile(tile)
}

export function duplicate_tile(sheet: Sheet, tile: Tile): Tile {
  const new_tile = tile.clone()
  new_tile.setPropValue("gridPosition", new Point(-1, -1))
  sheet.addTile(new_tile)
  return new_tile
}

function cloneAndRemap<T>(
  data: ArrayGrid<T>,
  cb: (index: Point, source: ArrayGrid<T>) => T,
): ArrayGrid<T> {
  const data2 = new ArrayGrid<T>(data.w, data.h)
  data2.fill((n) => cb(n, data))
  return data2
}

export function flipTileAroundVertical(value: Tile) {
  value.setPropValue(
    "data",
    cloneAndRemap(value.getPropValue("data"), (n: Point, data: ArrayGrid<number>) =>
      data.get_at(data.w - 1 - n.x, n.y),
    ),
  )
}

export function flipTileAroundHorizontal(value: Tile) {
  value.setPropValue(
    "data",
    cloneAndRemap(value.getPropValue("data"), (n: Point, data: ArrayGrid<number>) =>
      data.get_at(n.x, data.h - 1 - n.y),
    ),
  )
}

export function rotateTile90Clock(value: Tile) {
  value.setPropValue(
    "data",
    cloneAndRemap(value.getPropValue("data"), (n: Point, data: ArrayGrid<number>) =>
      data.get_at(n.y, data.w - 1 - n.x),
    ),
  )
}

export function rotateTile90CounterClock(value: Tile) {
  value.setPropValue(
    "data",
    cloneAndRemap(value.getPropValue("data"), (n: Point, data: ArrayGrid<number>) =>
      data.get_at(data.h - 1 - n.y, n.x),
    ),
  )
}

export const AddTileToSheetAction: SimpleMenuAction = {
  type: "simple",
  title: "add tile to sheet",
  perform: async (state) => {
    const sel = state.getSelectionPath()
    if (sel.start() instanceof Sheet) {
      const sheet = sel.start() as unknown as Sheet
      const tile = sheet.addNewTile()
      state.setSelectionTarget(tile)
    }
  },
}
export const DuplicateSelectedTileAction: SimpleMenuAction = {
  type: "simple",
  title: "duplicate tile",
  perform: async (state) => {
    const sel = state.getSelectionPath()
    if (sel.start() instanceof Tile && sel.parent().start() instanceof Sheet) {
      const tile = sel.start() as unknown as Tile
      const sheet = sel.parent().start() as unknown as Sheet
      const new_tile = duplicate_tile(sheet, tile)
      state.setSelectionTarget(new_tile)
    }
  },
}
export const DeleteSelectedTileAction: SimpleMenuAction = {
  type: "simple",
  title: "delete tile",
  icon: Icons.Trashcan,
  description: "delete selected tile from sheet",
  perform: async (state) => {
    const sel = state.getSelectionPath()
    if (sel.start() instanceof Tile && sel.parent().start() instanceof Sheet) {
      const tile = sel.start() as unknown as Tile
      const sheet = sel.parent().start() as unknown as Sheet
      sheet.removeTile(tile)
      const target = sheet.hasTiles() ? sheet.firstTile() : sheet
      state.setSelectionTarget(target as unknown as PropsBase<unknown>)
    }
  },
}
