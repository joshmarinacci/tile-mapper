import bmp, {BitsPerPixel, IImage} from "@wokwi/bmp-ts"
import {ArrayGrid, genId, Point, Size} from "josh_js_util"

import {PropDef, PropsBase} from "./base"
import {MapImpl, NameDef, SheetType, SpriteType, TestImpl} from "./defs"

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

type Etype = string
type ObservableListener = (type: Etype) => void

export class Observable {
    private listeners: Map<Etype, Array<ObservableListener>>

    constructor() {
        this.listeners = new Map<Etype, Array<ObservableListener>>()
    }

    protected _get_listeners(type: Etype): ObservableListener[] {
        if (!this.listeners.has(type)) this.listeners.set(type, new Array<ObservableListener>())
        return this.listeners.get(type) as ObservableListener[]
    }

    public addEventListener(type: Etype, cb: ObservableListener) {
        this._get_listeners(type).push(cb)
    }

    public removeEventListener(type: Etype, cb: ObservableListener) {
        let list = this._get_listeners(type)
        list = list.filter(l => l !== cb)
        this.listeners.set(type, list)
    }

    protected fire(type: Etype, payload: any) {
        this._get_listeners(type).forEach(cb => cb(payload))
    }
}

export type JSONSprite = {
    id:string
    name: string
    w: number,
    h: number,
    data: number[]
    palette?: string[]
    blocking:boolean,
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
    cells:EditableMapCell[]
}
export type JSONTest = {

}
export type JSONDoc = {
    color_palette:string[]
    sheets:JSONSheet[],
    maps: JSONMap[],
    tests: JSONTest[],
    version:number,
    name:string
}
const CURRENT_VERSION = 4
export const Changed = 'changed'

const SizeDef: PropDef<Size> = {
    type:'Size',
    editable:false,
    default: () => new Size(10,10),
    toJSON: (v) => v.toJSON(),
}
export class EditableSprite extends PropsBase<SpriteType> {
    data: ArrayGrid<number>
    palette:ImagePalette
    cache_canvas: HTMLCanvasElement | null
    constructor(w:number, h:number, pallete:ImagePalette) {
        super()
        this.setPropDef('name',NameDef)
        this.setPropValue('name',this.getPropDef('name').default())
        this.setPropDef('size',SizeDef)
        this.setPropValue('size', new Size(w,h))
        this.setPropDef('blocking',{
            type:"boolean",
            editable:true,
            default: () => false,
            toJSON: (v) => v,
        })
        this.setPropValue('blocking',this.getPropDef('blocking').default())
        this.palette = pallete
        this.data = new ArrayGrid<number>(w,h)
        this.data.fill(()=>0)
        this.cache_canvas = null
        this.rebuild_cache()
    }
    setPixel(number: number, point: Point) {
        this.data.set(point, number)
        this.rebuild_cache()
        this._fireAll()
    }
    width() {
        return this.getPropValue('size').w
    }
    height() {
        return this.getPropValue('size').h
    }
    getPixel(point: Point) {
        return this.data.get(point)
    }
    toJSONSprite():JSONSprite {
        return {
            name: this.getPropValue('name'),
            id: this._id,
            blocking: this.getPropValue('blocking'),
            w: this.getPropValue('size').w,
            h: this.getPropValue('size').h,
            data: this.data.data
        }
    }
    isValidIndex(pt: Point) {
        if(pt.x < 0) return false
        if(pt.y < 0) return false
        if(pt.x >= this.data.w) return false
        if(pt.y >= this.data.h) return false
        return true
    }
    clone() {
        const new_tile = new EditableSprite(this.width(),this.height(),this.palette)
        new_tile.data.data = this.data.data.slice()
        new_tile.setPropValue('blocking', this.getPropValue('blocking'))
        new_tile.setPropValue('name',this.getPropValue('name'))
        new_tile.setPropValue('size',this.getPropValue('size'))
        new_tile.rebuild_cache()
        return new_tile
    }
    rebuild_cache() {
        this.cache_canvas = document.createElement('canvas')
        this.cache_canvas.width = this.width()
        this.cache_canvas.height = this.height()
        const ctx = this.cache_canvas.getContext('2d') as CanvasRenderingContext2D
        drawEditableSprite(ctx,1,this)
    }

    static fromJSON(json_sprite: JSONSprite, color_palette: string[]) {
        const sprite = new EditableSprite(json_sprite.w,json_sprite.h,color_palette)
        sprite._id = json_sprite.id || genId('sprite')
        sprite.setPropValue('name',json_sprite.name)
        sprite.setPropValue('blocking', json_sprite.blocking)
        sprite.data.data = json_sprite.data
        sprite.rebuild_cache()
        return sprite
    }
}

export class EditableSheet extends PropsBase<SheetType> {
    sprites: EditableSprite[]
    constructor() {
        super()
        this.sprites = []
        this.setPropDef('name',NameDef)
        this.setPropValue('name',NameDef.default())
    }
    addSprite(sprite: EditableSprite) {
        this.sprites.push(sprite)
        this._fireAll()
    }
    removeSprite(sprite: EditableSprite) {
        const n = this.sprites.indexOf(sprite)
        if(n >= 0) {
            this.sprites.splice(n,1)
            this._fireAll()
        } else {
            console.warn("cannot delete sprite")
        }
    }
    getImages() {
        return this.sprites.slice()
    }
    toJSONSheet():JSONSheet {
        return {
            name: this.getPropValue('name'),
            id: this._id,
            sprites: this.sprites.map(sp => sp.toJSONSprite())
        }
    }
    static fromJSON(json_sheet: JSONSheet) {
        const sheet = new EditableSheet()
        sheet._id = json_sheet.id
        sheet.setPropValue('name',json_sheet.name)
        return sheet
    }
}

export type EditableMapCell = {
    tile:string, //id of the sprite used to draw this
}

type DocType = {
    name:string,
}
export class EditableDocument extends PropsBase<DocType> {
    private palette:ImagePalette
    private sheets:EditableSheet[]
    private maps:MapImpl[]
    private tests:TestImpl[]
    private sprite_lookup:Map<string,EditableSprite>
    constructor() {
        super()
        this.palette = []
        this.sheets = []
        this.maps = []
        this.setPropDef('name',NameDef)
        this.setPropValue('name',this.getPropDef('name').default())
        this.sprite_lookup = new Map()
        this.tests = []
    }
    addSheet(sheet:EditableSheet) {
        this.sheets.push(sheet)
        this._fireAll()
    }
    removeSheet(sheet:EditableSheet) {
        const n = this.sheets.indexOf(sheet)
        if(n < 0) {
            console.warn("cannot remove this sheet")
        } else {
            this.sheets.splice(n,1)
            this._fireAll()
        }
    }
    getSheets():EditableSheet[] {
        return this.sheets.slice()
    }
    addMap(map:MapImpl){
        this.maps.push(map)
        this._fireAll()
    }
    removeMap(map:MapImpl) {
        const n = this.maps.indexOf(map)
        if(n < 0) {
            console.warn("cannot remove this map")
        } else {
            this.maps.splice(n,1)
            this._fireAll()
        }
    }
    getMaps():MapImpl[] {
        return this.maps.slice()
    }
    addTest(test:TestImpl) {
        this.tests.push(test)
        this._fireAll()
    }
    removeTest(test:TestImpl) {
        const n = this.tests.indexOf(test)
        if(n < 0) {
            console.warn("cannot remove this map")
        } else {
            this.tests.splice(n,1)
            this._fireAll()
        }
    }
    getTests():TestImpl[] {
        return this.tests.slice()
    }
    setPalette(palette:ImagePalette) {
        this.palette = palette
        this._fireAll()
    }
    toJSONDoc():JSONDoc {
        return {
            name: this.getPropValue('name'),
            color_palette: this.palette,
            version: CURRENT_VERSION,
            sheets: this.sheets.map(sh => sh.toJSONSheet()),
            maps: this.maps.map(mp => mp.toJSONMap()),
            tests: this.tests.map(tst => tst.toJSON())
        }
    }
    getPalette() {
        return this.palette
    }
    lookup_sprite(id: string) {
        if(this.sprite_lookup.has(id)) return this.sprite_lookup.get(id)
        for(const sheet of this.sheets) {
            for(const sprite of sheet.sprites) {
                if(sprite._id === id) {
                    // console.log("missed the cache",sprite.id)
                    this.sprite_lookup.set(sprite._id,sprite)
                    return sprite
                }
            }
        }
        return null
    }
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
    const doc = new EditableDocument()
    doc.setPropValue('name',json_doc.name)
    doc.setPalette(json_doc.color_palette)
    json_doc.sheets.forEach(json_sheet => {
        const sheet = EditableSheet.fromJSON(json_sheet)
        doc.addSheet(sheet)
        json_sheet.sprites.forEach(json_sprite => {
            sheet.addSprite(EditableSprite.fromJSON(json_sprite,json_doc.color_palette))
        })
    })
    json_doc.maps.forEach(json_map => {
        doc.addMap(MapImpl.fromJSON(json_map))
    })
    json_doc.tests.forEach(json_test => {
        doc.addTest(TestImpl.fromJSON(json_test))
    })
    return doc
}


export function log(...args: any) {
    console.log(...args)
}

export function fileToJson(file:File) {
    return new Promise((resolve, reject) => {
        const fileReader = new FileReader()
        // @ts-ignore
        fileReader.onload = event => resolve(JSON.parse(event.target.result))
        fileReader.onerror = error => reject(error)
        fileReader.readAsText(file)
    })
}

export function jsonObjToBlob(toJsonObj: any) {
    console.log('saving out',toJsonObj)
    const str = JSON.stringify(toJsonObj, null, '   ')
    return new Blob([str])
}

export function drawEditableSprite(ctx: CanvasRenderingContext2D, scale: number, image: EditableSprite) {
    for (let i = 0; i < image.width(); i++) {
        for (let j = 0; j < image.height(); j++) {
            const v: number = image.getPixel(new Point(i, j))
            ctx.fillStyle = image.palette[v]
            ctx.fillRect(i * scale, j * scale, scale, scale)
        }
    }
}

export function sheet_to_canvas(sheet: EditableSheet) {
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
                const A = id.data[n + 3]


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
