import bmp, {BitsPerPixel, IImage} from "@wokwi/bmp-ts"
import {ArrayGrid, Point} from "josh_js_util"

import {DocModel, MapCell, MapModel, SheetModel, SpriteModel, TestImpl} from "./defs"

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
ArrayGrid.prototype.isValidIndex = function(pt: Point) {
    if(pt.x < 0) return false
    if(pt.y < 0) return false
    if(pt.x >= this.w) return false
    if(pt.y >= this.h) return false
    return true
}


export type ImagePalette = string[]
export const PICO8:ImagePalette = [
    '#000000',
    '#1D2B53',
    '#7E2553',
    '#008751',
    '#AB5236',
    '#5F574F',
    '#C2C3C7',
    '#FFF1E8',
    '#FF004D',
    '#FFA300',
    '#FFEC27',
    '#00E436',
    '#29ADFF',
    '#83769C',
    '#FF77A8',
    '#FFCCAA',
    'transparent',
]
export const MINECRAFT:ImagePalette = [
    '#ffffff',
    '#999999',
    '#4c4c4c',
    '#191919',
    '#664c33',
    '#993333',
    '#d87f33',
    '#e5e533',
    '#7fcc19',
    '#667f33',
    '#4c7f99',
    '#6699d8',
    '#334cb2',
    '#7f3fb2',
    '#b24cd8',
    '#f27fa5',
]

export type JSONSprite = {
    name: string
    id:string
    w: number,
    h: number,
    blocking:boolean,
    data: number[]
    palette?: string[]
}
export type JSONSheet = {
    id:string,
    name:string,
    sprites:JSONSprite[]
}
export type JSONMap = {
    id:string,
    name:string,
    height: number,
    width: number
    cells:MapCell[]
}
export type JSONTest = {
    id:string,
    name:string,
    viewport: {
        width: number,
        height: number,
    },
}
export type JSONDoc = {
    color_palette:string[]
    sheets:JSONSheet[],
    maps: JSONMap[],
    tests: JSONTest[],
    version:number,
    name:string
}


export function make_doc_from_json(raw_data: object) {
    if(!('version' in raw_data)) throw new Error('we cannot load this document')
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if(raw_data['version'] < 3) throw new Error("we cannot load this document")
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if(raw_data['version'] < 4) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        raw_data.maps = []
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        raw_data.tests = []
    }
    const json_doc = raw_data as JSONDoc
    if(json_doc.color_palette.length === 0) {
        json_doc.color_palette = PICO8
    }
    const doc = new DocModel()
    doc.setPropValue('name',json_doc.name)
    doc.setPalette(json_doc.color_palette)
    json_doc.sheets.forEach(json_sheet => {
        const sheet = SheetModel.fromJSON(json_sheet)
        doc.addSheet(sheet)
        json_sheet.sprites.forEach(json_sprite => {
            sheet.addSprite(SpriteModel.fromJSON(json_sprite,json_doc.color_palette))
        })
    })
    json_doc.maps.forEach(json_map => {
        doc.addMap(MapModel.fromJSON(json_map))
    })
    json_doc.tests.forEach(json_test => {
        doc.addTest(TestImpl.fromJSON(json_test))
    })
    return doc
}

export function fileToJson(file:File) {
    return new Promise((resolve, reject) => {
        const fileReader = new FileReader()
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        fileReader.onload = event => resolve(JSON.parse(event.target.result))
        fileReader.onerror = error => reject(error)
        fileReader.readAsText(file)
    })
}

export function jsonObjToBlob(toJsonObj: object) {
    console.log('saving out',toJsonObj)
    const str = JSON.stringify(toJsonObj, null, '   ')
    return new Blob([str])
}

export function drawEditableSprite(ctx: CanvasRenderingContext2D, scale: number, image: SpriteModel) {
    for (let i = 0; i < image.width(); i++) {
        for (let j = 0; j < image.height(); j++) {
            const v: number = image.getPixel(new Point(i, j))
            ctx.fillStyle = image.palette[v]
            ctx.fillRect(i * scale, j * scale, scale, scale)
        }
    }
}

export function sheet_to_canvas(sheet: SheetModel) {
    const sprite = sheet.getImages()[0]
    const canvas = document.createElement('canvas')
    canvas.width = sprite.width() * sheet.getImages().length
    canvas.height = sprite.height()
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
    sheet.getImages().forEach((img, i) => {
        ctx.save()
        ctx.translate(i * sprite.width(), 0)
        drawEditableSprite(ctx, 1, img)
        ctx.restore()
    })
    return canvas
}

export function canvas_to_bmp(canvas: HTMLCanvasElement, palette1: string[]) {
    //get ImageData from the canvas
    const id = (canvas.getContext('2d') as CanvasRenderingContext2D).getImageData(0, 0, canvas.width, canvas.height)

    function swizzle_data(id: ImageData) {
        for (let i = 0; i < id.width; i++) {
            for (let j = 0; j < id.height; j++) {
                const n = (i + id.width * j) * 4

                const R = id.data[n + 0]
                const G = id.data[n + 1]
                const B = id.data[n + 2]
                // const A = id.data[n + 3]


                id.data[n + 0] = 255
                id.data[n + 1] = B
                id.data[n + 2] = G
                id.data[n + 3] = R
            }
        }
    }

    swizzle_data(id)

    function strToRGBObj(str: string) {
        const num = parseInt(str.substring(1), 16)
        const red = (num & 0xFF0000) >> 16
        const green = (num & 0x00FF00) >> 8
        const blue = (num & 0x0000FF) >> 0
        return {
            red: red,
            green: green,
            blue: blue,
            quad: 255,
        }
    }

    const palette = palette1.map(str => strToRGBObj(str))
    while (palette.length < 128) {
        palette.push({red: 0, green: 255, blue: 0, quad: 255})
    }

    const bmpData: IImage = {
        data: id.data as unknown as Uint8Array,
        bitPP: 8 as BitsPerPixel,
        width: canvas.width,
        height: canvas.height,
        palette: palette,
    }
    return bmp.encode(bmpData)
}
