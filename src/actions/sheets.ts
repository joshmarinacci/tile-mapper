import { ArrayGrid, Point } from "josh_js_util"
import { canvas_to_blob, forceDownloadBlob } from "josh_web_util"

import { canvas_to_bmp, ImagePalette, sheet_to_canvas } from "../common/common"
import { removeFromList } from "../model/base"
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
  if (tile) sheet.removeTile(tile)
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
