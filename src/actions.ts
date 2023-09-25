import {ArrayGrid, Point, Size} from "josh_js_util"
import {canvas_to_blob, forceDownloadBlob} from "josh_web_util"

import {appendToList, PropsBase, SimpleMenuAction} from "./base"
import {canvas_to_bmp, drawEditableSprite, sheet_to_canvas} from "./common"
import {ActorLayer, GameDoc, GameMap, MapLayerType, Sheet, Tile, TileLayer} from "./datamodel"
import {docToJSON, fileToJson, jsonObjToBlob, make_doc_from_json} from "./json"
import {GlobalState} from "./state"

export const SaveAction:SimpleMenuAction = {
    type: "simple",
    title: "Save",
    async perform(state): Promise<void> {
        const doc = state.getPropValue('doc') as GameDoc
        const blob = jsonObjToBlob(docToJSON(doc))
        forceDownloadBlob(`${doc.getPropValue('name')}.json`,blob)
    },
}

export const DocToPNG:SimpleMenuAction = {
    type: "simple",
    title: "to PNG",
    async perform(state): Promise<void> {
        const doc = state.getPropValue('doc') as GameDoc
        for(const sheet of doc.getPropValue('sheets')) {
            const can = sheet_to_canvas(sheet)
            const blob = await canvas_to_blob(can)
            forceDownloadBlob(`${doc.getPropValue('name')}.${sheet.getPropValue('name')}.png`,blob)
        }
    }
}

export const DocToBMP:SimpleMenuAction = {
    type:'simple',
    title:'to BMP',
    async perform(state) {
        const doc = state.getPropValue('doc') as GameDoc
        const sheet = doc.getPropValue('sheets')[0]
        const canvas = sheet_to_canvas(sheet)
        const rawData = canvas_to_bmp(canvas, doc.getPropValue('palette'))
        const blob = new Blob([rawData.data], {type: 'image/bmp'})
        forceDownloadBlob(`${sheet.getPropValue('name')}.bmp`, blob)

    }
}

export const LoadFileAction:SimpleMenuAction = {
    type:"simple",
    title:'load',
    async perform (state:GlobalState ) {
        const input_element = document.createElement('input')
        input_element.setAttribute('type','file')
        input_element.style.display = 'none'
        document.body.appendChild(input_element)
        const new_doc = await new Promise<GameDoc>((res, rej)=>{
            input_element.addEventListener('change',() => {
                const files = input_element.files
                if(!files || files.length <= 0) return
                const file = files[0]
                fileToJson(file).then(data => res(make_doc_from_json(data as object)))
            })
            input_element.click()
        })
        console.log('new doc is',new_doc)
        state.setPropValue('doc',new_doc)
    }
}

export function deleteTile(sheet: Sheet, tile: Tile) {
    if (tile) sheet.removeTile(tile)
}

export function duplicate_tile(sheet: Sheet, tile: Tile): Tile {
    const new_tile = tile.clone()
    sheet.addTile(new_tile)
    return new_tile
}

function cloneAndRemap<T>(data: ArrayGrid<T>, cb: (index: Point, source: ArrayGrid<T>) => T): ArrayGrid<T> {
    const data2 = new ArrayGrid<T>(data.w, data.h)
    data2.fill((n) => cb(n, data))
    return data2
}

export function flipTileAroundVertical(value: Tile) {
    value.setPropValue('data', cloneAndRemap(value.getPropValue('data'), (n: Point, data: ArrayGrid<number>) => data.get_at(data.w - 1 - n.x, n.y)))
}

export function flipTileAroundHorizontal(value: Tile) {
    value.setPropValue('data', cloneAndRemap(value.getPropValue('data'), (n: Point, data: ArrayGrid<number>) => data.get_at(n.x, data.h - 1 - n.y)))
}

export function rotateTile90Clock(value: Tile) {
    value.setPropValue('data', cloneAndRemap(value.getPropValue('data'), (n: Point, data: ArrayGrid<number>) => data.get_at(n.y, data.w - 1 - n.x)))
}

export function rotateTile90CounterClock(value: Tile) {
    value.setPropValue('data', cloneAndRemap(value.getPropValue('data'), (n: Point, data: ArrayGrid<number>) => data.get_at(data.h - 1 - n.y, n.x)))
}

function map_to_canvas(map: GameMap, doc: GameDoc, scale: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas')
    const mapSize = map.calcBiggestLayer()
    const size = doc.getPropValue('tileSize')
    canvas.width = mapSize.w * scale * size.w
    canvas.height = mapSize.h * scale * size.h
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
    ctx.imageSmoothingEnabled = false
    map.getPropValue('layers').forEach(layer => {
        if (layer instanceof TileLayer) {
            const cells = layer.getPropValue('data')
            cells.forEach((v, n) => {
                if (v) {
                    const x = n.x * size.w * scale
                    const y = n.y * size.w * scale
                    const tile = doc.lookup_sprite(v.tile)
                    if (tile) {
                        if (tile.cache_canvas) {
                            ctx.drawImage(tile.cache_canvas,
                                //src
                                0, 0, tile.cache_canvas.width, tile.cache_canvas.height,
                                //dst
                                x,
                                y,
                                size.w * scale, size.h * scale
                            )
                        } else {
                            drawEditableSprite(ctx, scale, tile)
                        }
                    }
                }

            })
        }
    })
    return canvas
}

export async function exportPNG(doc: GameDoc, map: GameMap, scale: number) {
    const can = map_to_canvas(map, doc, scale)
    const blob = await canvas_to_blob(can)
    forceDownloadBlob(`${map.getPropValue('name') as string}.${scale}x.png`, blob)
}

export const add_tile_layer = (map: GameMap) => {
    const layer = new TileLayer({name: 'new tile layer', size: new Size(20, 10), scrollSpeed: 1, visible: true, wrapping: false})
    appendToList(map, "layers", layer)
}
export const add_actor_layer = (map: GameMap) => {
    const layer = new ActorLayer({name: 'new actor layer', visible: true, blocking: true})
    appendToList(map, 'layers', layer)
}
export const delete_layer = (layer: PropsBase<MapLayerType> | undefined, map: GameMap) => {
    if (!layer) return
    let layers = map.getPropValue('layers') as PropsBase<MapLayerType>[]
    layers = layers.slice()
    const n = layers.indexOf(layer)
    if (n >= 0) {
        layers.splice(n, 1)
    }
    map.setPropValue('layers', layers)
}
export const move_layer_up = (layer: PropsBase<MapLayerType> | undefined, map: GameMap) => {
    if (!layer) return
    let layers = map.getPropValue('layers') as PropsBase<MapLayerType>[]
    layers = layers.slice()
    const n = layers.indexOf(layer)
    if (n >= layers.length) return
    layers.splice(n, 1)
    layers.splice(n + 1, 0, layer)
    map.setPropValue('layers', layers)
}
export const move_layer_down = (layer: PropsBase<MapLayerType> | undefined, map: GameMap) => {
    if (!layer) return
    let layers = map.getPropValue('layers') as PropsBase<MapLayerType>[]
    layers = layers.slice()
    const n = layers.indexOf(layer)
    if (n <= 0) return
    layers.splice(n, 1)
    layers.splice(n - 1, 0, layer)
    map.setPropValue('layers', layers)

}
