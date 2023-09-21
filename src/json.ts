import {ArrayGrid, Size} from "josh_js_util"

import {DefList, JsonOut, PropsBase} from "./base"
import {Doc2, Map2, Sheet2, Tile2, TileLayer2} from "./data2"
import {MapCell} from "./defs"
import {PICO8} from "./model"

export type JSONSprite = {
    name: string
    id: string
    w: number,
    h: number,
    blocking: boolean,
    data: number[]
    palette?: string[]
}
export type JSONSheet = {
    id: string,
    name: string,
    sprites: JSONSprite[]
}

export type JSONActor = {
    id:string,
    name:string,
}
export type JSONMap = {
    id: string,
    name: string,
    height: number,
    width: number
    cells: MapCell[]
}
export type JSONTest = {
    id: string,
    name: string,
    viewport: {
        width: number,
        height: number,
    },
}
export type JSONDocV4 = {
    color_palette: string[]
    sheets: JSONSheet[],
    maps: JSONMap[],
    tests: JSONTest[],
    version: number,
    name: string
}

type JSONSize = {
    w: number,
    h: number,
}
type JSONTile = {
    id: string,
    name: string,
    data: number[],
    blocking: boolean,
    size: JSONSize,
}
type JSONLayer = {
    id:string,
    name:string,
    type:string,
    blocking:boolean,
    visible:boolean,
}
type JSONMapV5 = {
    id: string,
    name: string,
    layers: JSONLayer[],
}
type JSONSheetV5 = {
    id: string,
    name: string,
    tileSize: JSONSize,
    tiles: JSONTile[]
}
type JSONDocV5 = {
    name: string
    version: 5
    doc: object
}

// function sheetToJSONV5(sheet: Sheet2):JSONSheetV5 {
//     const tiles: JSONTile[] = sheet.getPropValue('tiles')
//         .map(tile => (tile.toJSON() as JSONTile))
//     return {
//         id: sheet._id,
//         name: sheet.getPropValue('name'),
//         tileSize: sheet.getPropValue('tileSize'),
//         tiles: tiles,
//     }
// }
//
// function mapToJSONV5(map: Map2):JSONMapV5 {
//     return {
//         id: map._id,
//         name: map.getPropValue('name'),
//         layers: map.getPropValue('layers').map(layer => {
//             return layer.toJSON() as JSONLayer
//         })
//     } as JSONMapV5
// }

export function docToJSON(doc: Doc2):JSONDocV5 {
    return {
        version:5,
        name:    doc.getPropValue('name'),
        doc: doc.toJSON(),
    }
}

export function jsonObjToBlob(toJsonObj: object) {
    console.log('saving out', toJsonObj)
    const str = JSON.stringify(toJsonObj, null, '   ')
    return new Blob([str])
}


function load_v4json(json_doc: JSONDocV4) {
    const doc = new Doc2()
    doc.setPropValue('palette', json_doc.color_palette)
    doc.setPropValue('name', json_doc.name)
    json_doc.sheets.forEach(json_sheet => {
        const sheet = new Sheet2({
            name: json_sheet.name,
        })
        sheet._id = json_sheet.id
        json_sheet.sprites.forEach(json_sprite => {
            const tile = new Tile2({
                name: json_sprite.name,
                blocking: json_sprite.blocking,
                size: new Size(json_sprite.w, json_sprite.h),
            }, json_doc.color_palette as string[])
            tile._id = json_sprite.id
            console.log("loading tile", tile._id)
            tile.data.data = json_sprite.data
            tile.rebuild_cache()
            sheet.addTile(tile)
        })
        doc.getPropValue('sheets').push(sheet)
    })
    json_doc.maps.forEach(json_map => {
        const map_size = new Size(json_map.width, json_map.height)
        const layer = new TileLayer2({
            name: json_map.name,
            blocking: true,
            size: map_size,
        })
        const data = new ArrayGrid<number>(map_size.w, map_size.h)
        data.data = json_map.cells
        layer.setPropValue('data', data)
        const map = new Map2({
            name: json_map.name,
            layers: [layer]
        })
        map._id = json_map.id

        doc.getPropValue('maps').push(map)
    })
    // json_doc.tests.forEach(json_test => {
    //     doc.getPropValue('tests').push(TestModel.fromJSON(json_test))
    // })
    return doc
}

function load_v5json(jsonDoc: JSONDocV5) {
    console.log("loading json doc", jsonDoc)
    const doc = new Doc2({
        name: jsonDoc.name,
        palette: jsonDoc.palette,
        tileSize: Size.fromJSON(jsonDoc.tileSize),
        sheets: jsonDoc.sheets.map(sheet => {
            return new Sheet2({
                name: sheet.name,
                tileSize: Size.fromJSON(sheet.tileSize),
                tiles: sheet.tiles.map(tile => {
                    const new_tile = new Tile2({
                        name: tile.name,
                        size: Size.fromJSON(tile.size),
                        blocking: tile.blocking,
                    })
                    new_tile.data.data = tile.data,
                    new_tile._id = tile.id
                    return new_tile
                })
            })
        }),
        maps: [],
        actors: [],
        tests: []
    })
    return doc
}

export function make_doc_from_json(raw_data: object):Doc2 {
    if (!('version' in raw_data)) throw new Error('we cannot load this document')
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (raw_data['version'] < 3) throw new Error("we cannot load this document")
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (raw_data['version'] < 4) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        raw_data.maps = []
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        raw_data.tests = []
    }
    const json_doc = raw_data as JSONDocV4
    if(json_doc.version === 5) {
        return load_v5json(json_doc as JSONDocV5)
    }
    console.log("json doc", json_doc)
    if (json_doc.color_palette.length === 0) {
        json_doc.color_palette = PICO8
    }
    if (json_doc.version === 4) {
        return load_v4json(json_doc)
    }
}

export function fileToJson(file: File) {
    return new Promise((resolve, reject) => {
        const fileReader = new FileReader()
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        fileReader.onload = event => resolve(JSON.parse(event.target.result))
        fileReader.onerror = error => reject(error)
        fileReader.readAsText(file)
    })
}


class ClassRegistry {
    classByName:Map<string,any>
    defsByName:Map<string,DefList<any>>
    constructor() {
        this.classByName = new Map()
        this.defsByName = new Map()
    }
    register<Type>(clazz:any, defs:DefList<Type>) {
        console.log("registering class",clazz)
        this.classByName.set(clazz.name, clazz)
        this.defsByName.set(clazz.name, defs)
    }
}
export const CLASS_REGISTRY = new ClassRegistry()

export function restoreClassFromJSON<Type>(json:JsonOut<Type>):PropsBase<Type> {
    console.log("restoring class",json)
    const Clazz = CLASS_REGISTRY.classByName.get(json.class)
    const defs = CLASS_REGISTRY.defsByName.get(json.class)
    if(!defs) throw new Error(`defs missing for ${json.class}`)
    const args = { }
    for(const key of Object.keys(defs)) {
        const def = defs[key]
        const val = def.fromJSON?def.fromJSON(json.props[key]):json.props[key]
        args[key] = val
    }
    const obj = new Clazz(args)
    obj._id = json.id
    return obj
}
