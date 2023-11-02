import { ArrayGrid, Size } from "josh_js_util"
import { canvas_to_blob, forceDownloadBlob } from "josh_web_util"

import { map_to_canvas } from "../actions/actions"
import { PICO8 } from "../common/common"
import { appendToList, restoreClassFromJSON } from "../model/base"
import { GameMap, MapCell, Sheet, Tile, TileLayer } from "../model/datamodel"
import { GameDoc } from "../model/gamedoc"
import { GlobalState } from "../state"
import { writeMetadata } from "./vendor"

export type JSONSprite = {
  name: string
  id: string
  w: number
  h: number
  blocking: boolean
  data: number[]
  palette?: string[]
}
export type JSONSheet = {
  id: string
  name: string
  sprites: JSONSprite[]
}

export type JSONActor = {
  id: string
  name: string
}
export type JSONMap = {
  id: string
  name: string
  height: number
  width: number
  cells: MapCell[]
}
export type JSONTest = {
  id: string
  name: string
  viewport: {
    width: number
    height: number
  }
}
export type JSONDocV4 = {
  color_palette: string[]
  sheets: JSONSheet[]
  maps: JSONMap[]
  tests: JSONTest[]
  version: number
  name: string
}

export const TILE_MAPPER_DOCUMENT = "tile-mapper-document"
export type JSONDocV5 = {
  name: string
  kind: typeof TILE_MAPPER_DOCUMENT
  version: 5
  doc: object
}

export function docToJSON(doc: GameDoc): JSONDocV5 {
  return {
    version: 5,
    name: doc.getPropValue("name"),
    kind: TILE_MAPPER_DOCUMENT,
    doc: doc.toJSON(),
  }
}

export function jsonObjToBlob(toJsonObj: object) {
  console.log("saving out", toJsonObj)
  const str = JSON.stringify(toJsonObj, null, "   ")
  return new Blob([str])
}

function load_v4json(json_doc: JSONDocV4): GameDoc {
  const doc = new GameDoc()
  doc.setPropValue("palette", json_doc.color_palette)
  doc.setPropValue("name", json_doc.name)
  json_doc.sheets.forEach((json_sheet) => {
    const sheet = new Sheet({
      name: json_sheet.name,
    })
    sheet._id = json_sheet.id
    json_sheet.sprites.forEach((json_sprite) => {
      const tile = new Tile({
        name: json_sprite.name,
        blocking: json_sprite.blocking,
        size: new Size(json_sprite.w, json_sprite.h),
      })
      tile._id = json_sprite.id
      console.log("loading tile", tile._id)
      const data = tile.getPropValue("data")
      data.data = json_sprite.data
      sheet.addTile(tile)
    })
    doc.getPropValue("sheets").push(sheet)
  })
  json_doc.maps.forEach((json_map) => {
    const map_size = new Size(json_map.width, json_map.height)
    const layer = new TileLayer({
      name: json_map.name,
      type: "tile-layer",
      blocking: true,
      size: map_size,
    })
    const data = new ArrayGrid<number>(map_size.w, map_size.h)
    data.data = json_map.cells
    layer.setPropValue("data", data)
    const map = new GameMap({
      name: json_map.name,
      layers: [layer],
    })
    map._id = json_map.id
    appendToList(doc, "maps", map)
  })
  // json_doc.tests.forEach(json_test => {
  //     doc.getPropValue('tests').push(TestModel.fromJSON(json_test))
  // })
  return doc
}

function load_v5json(jsonDoc: JSONDocV5): GameDoc {
  return restoreClassFromJSON(jsonDoc.doc) as GameDoc
}

export function make_doc_from_json(raw_data: object): GameDoc {
  if (!("version" in raw_data)) throw new Error("we cannot load this document")
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (raw_data["version"] < 3) throw new Error("we cannot load this document")
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (raw_data["version"] < 4) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    raw_data.maps = []
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    raw_data.tests = []
  }
  const json_doc = raw_data as JSONDocV4
  if (json_doc.version === 5) {
    return load_v5json(json_doc as JSONDocV5)
  }
  console.log("json doc", json_doc)
  if (json_doc.color_palette.length === 0) {
    json_doc.color_palette = PICO8
  }
  if (json_doc.version === 4) {
    return load_v4json(json_doc)
  }
  throw new Error("cannot load this document")
}

export function fileToJson(file: File) {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader()
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    fileReader.onload = (event) => resolve(JSON.parse(event.target.result))
    fileReader.onerror = (error) => reject(error)
    fileReader.readAsText(file)
  })
}

export async function stateToCanvas(state: GlobalState) {
  const doc = state.getPropValue("doc")
  // just save the first sheet
  const maps = doc.getPropValue("maps")
  if (maps.length > 0) {
    const can = map_to_canvas(maps[0], doc, 4)
    return Promise.resolve(can)
  }

  const canvas = document.createElement("canvas")
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D
  ctx.fillStyle = "red"
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  return Promise.resolve(canvas)
}

export async function savePNGJSON(state: GlobalState) {
  const canvas = await stateToCanvas(state)
  const json_obj = docToJSON(state.getPropValue("doc"))
  const json_string = JSON.stringify(json_obj, null, "    ")

  const blob = await canvas_to_blob(canvas)
  const array_buffer = await blob.arrayBuffer()
  const uint8buffer = new Uint8Array(array_buffer)

  const out_buffer = writeMetadata(uint8buffer as Buffer, {
    tEXt: { SOURCE: json_string },
  })
  const final_blob = new Blob([out_buffer as BlobPart], { type: "image/png" })
  forceDownloadBlob(state.getPropValue("doc").getPropValue("name") + ".json.png", final_blob)
}

export type Metadata = { tEXt: { keyword: any; SOURCE: any } }
