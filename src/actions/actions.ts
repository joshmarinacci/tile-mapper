import {ArrayGrid, Point, Size} from "josh_js_util"
import {canvas_to_blob, forceDownloadBlob} from "josh_web_util"

import {canvas_to_bmp, drawEditableSprite, ImagePalette, sheet_to_canvas} from "../common/common"
import {
    docToJSON,
    fileToJson,
    JSONDocV5,
    jsonObjToBlob,
    make_doc_from_json,
    Metadata,
    savePNGJSON,
} from "../io/json"
import {saveLocalStorage} from "../io/local"
import {readMetadata} from "../io/vendor"
import {appendToList, PropsBase, removeFromList, SimpleMenuAction} from "../model/base"
import {ActorLayer, GameDoc, GameMap, MapLayerType, Sheet, Tile, TileLayer} from "../model/datamodel"
import {GlobalState} from "../state"

export const ExportToJSONAction:SimpleMenuAction = {
    type: "simple",
    title: "Export to JSON",
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

export const ImportFromJSONAction:SimpleMenuAction = {
    type:"simple",
    title:'import plain JSON',
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
        state.setPropValue('selection',new_doc)
    }
}

export const SaveLocalStorageAction:SimpleMenuAction = {
    type:'simple',
    // icon:SupportedIcons.SaveDocument,
    title:'Save',
    description:'save the document in the browsers internal storage',
    tags:['save','local'],
    perform:async(state) => {
        await saveLocalStorage(state, false)
    }
}
export const SavePNGJSONAction:SimpleMenuAction = {
    type:'simple',
    // icon:SupportedIcons.SaveDocument,
    title:'Save As doc.JSON.PNG',
    description:'Save the document as a PNG with the document embedded inside of the PNG as JSON.',
    tags:['save','export','download','png'],
    perform:async (state) => {
        await savePNGJSON(state)
    },
}

export async function loadPNGJSON(state:GlobalState, file:File):Promise<GameDoc> {
    return new Promise((res,rej) => {
        const reader = new FileReader()
        reader.addEventListener('load', () => {
            const buffer = new Uint8Array(reader.result as ArrayBufferLike)
            const metadata = readMetadata(buffer as Buffer) as unknown as Metadata
            console.log("metadata is",metadata)
            if(metadata && metadata.tEXt && metadata.tEXt.SOURCE) {
                const json = JSON.parse(metadata.tEXt.SOURCE)
                const obj = make_doc_from_json(json as JSONDocV5)
                res(obj)
            }
        })
        reader.addEventListener('error', () => rej())
        reader.readAsArrayBuffer(file)
    })
}


export const export_bmp = (sheet:Sheet, palette:ImagePalette) => {
    const canvas = sheet_to_canvas(sheet)
    const rawData = canvas_to_bmp(canvas, palette.colors)
    const blob = new Blob([rawData.data], {type: 'image/bmp'})
    forceDownloadBlob(`${sheet.getPropValue('name')}.bmp`, blob)
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

export function map_to_canvas(map: GameMap, doc: GameDoc, scale: number): HTMLCanvasElement {
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

export const DeleteSheetAction:SimpleMenuAction = {
    type:"simple",
    title:'delete sheet',
    perform:async (state) => {
        const sel = state.getPropValue('selection')
        if(sel instanceof Sheet) {
            removeFromList(state.getPropValue('doc'),'sheets',sel as Sheet)
            state.setPropValue('selection',null)
        }
    }
}
export const DeleteMapAction:SimpleMenuAction = {
    type:"simple",
    title:'delete map',
    perform:async (state) => {
        const sel = state.getPropValue('selection')
        if(sel instanceof GameMap) {
            removeFromList(state.getPropValue('doc'),'maps',sel as GameMap)
            state.setPropValue('selection',null)
        }
    }
}
