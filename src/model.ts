import bmp, {BitsPerPixel, IImage} from "@wokwi/bmp-ts"
import {ArrayGrid, genId, Point, Size} from "josh_js_util"

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
}

export type JSONSheet = {
    id:string,
    name:string,
    sprites:JSONSprite[]
}
export type JSONMapCell = {
    tile:string,
}
export type JSONMap = {
    id:string,
    name:string,
    width:number,
    height:number,
    cells:JSONMapCell[],
}
export type JSONTest = {
    id:string,
    name:string,
    map_id:string,
    viewport:{
        width:number,
        height:number,
    }
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

export class EditableSprite extends Observable {
    private w: number
    private h: number
    data: number[]
    id:string
    private name:string
    palette:ImagePalette
    cache_canvas: HTMLCanvasElement | null
    constructor(w:number, h:number, pallete:ImagePalette) {
        super()
        this.name = 'unnamed'
        this.id = genId('tile')
        this.palette = pallete
        this.w = w
        this.h = h
        this.data = []
        for (let k = 0; k < this.w * this.h; k++) {
            this.data[k] = 0
        }
        this.cache_canvas = null
        this.rebuild_cache()
    }
    setPixel(number: number, point: Point) {
        const n = point.x + point.y * this.w
        this.data[point.x + point.y * this.w] = number
        this.rebuild_cache()
        this.fire(Changed,this)
    }
    width() {
        return this.w
    }
    height() {
        return this.h
    }
    getPixel(point: Point) {
        return this.data[point.x + point.y * this.w]
    }
    getName() {
        return this.name
    }
    setName(name:string) {
        this.name = name
        this.fire(Changed,this)
    }

    toJSONSprite():JSONSprite {
        return {
            id:this.id,
            name:this.name,
            w: this.w,
            h: this.h,
            data: this.data.slice()
        }
    }

    isValidIndex(pt: Point) {
        if(pt.x < 0) return false
        if(pt.y < 0) return false
        if(pt.x >= this.w) return false
        if(pt.y >= this.h) return false
        return true
    }

    clone() {
        const new_tile = new EditableSprite(this.width(),this.height(),this.palette)
        new_tile.data = this.data.slice()
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
}

export class EditableSheet extends Observable {
    sprites: EditableSprite[]
    id:string
    private name:string
    constructor() {
        super()
        this.sprites = []
        this.name = 'unnamed sheet'
        this.id = genId('sheet')
    }
    addSprite(sprite: EditableSprite) {
        this.sprites.push(sprite)
        this.fire(Changed,this)
    }
    removeSprite(sprite: EditableSprite) {
        const n = this.sprites.indexOf(sprite)
        if(n >= 0) {
            this.sprites.splice(n,1)
            this.fire(Changed,this)
        } else {
            console.warn("cannot delete sprite")
        }
    }
    getImages() {
        return this.sprites.slice()
    }
    getName() {
        return this.name
    }
    setName(name: string) {
        this.name = name
        this.fire(Changed,this)
    }
    toJSONSheet():JSONSheet {
        return {
            name:this.name,
            id:this.id,
            sprites: this.sprites.map(sp => sp.toJSONSprite())
        }
    }
}

export type EditableMapCell = {
    tile:string, //id of the sprite used to draw this
}
export class EditableMap extends Observable {
    id:string
    private name:string
    cells: ArrayGrid<EditableMapCell>
    constructor(width:number, height:number) {
        super()
        this.name = 'unnamed map'
        this.id = genId('map')
        this.cells = new ArrayGrid<EditableMapCell>(width, height)
        this.cells.fill(()=>({tile:"nothin"}))
    }
    getName() {
        return this.name
    }
    setName(name: string) {
        this.name = name
        this.fire(Changed,this)
    }
    toJSONMap():JSONMap {
        return {
            name: this.name,
            id:this.id,
            width:this.cells.w,
            height:this.cells.h,
            cells:this.cells.data
        }
    }
    width() {
        return this.cells.w
    }
    height() {
        return this.cells.h
    }
}

export class EditableTest extends Observable {
    id:string
    name:string
    map:EditableMap|undefined
    viewport:Size
    constructor() {
        super()
        this.name = "unnamed test"
        this.id = genId('test')
        this.viewport = new Size(10,10)
    }
    getName() {
        return this.name
    }
    setName(name: string) {
        this.name = name
        this.fire(Changed,this)
    }
    toJSONTest():JSONTest {
        console.log('this.map is',this.map)
        return {
            id:this.id,
            name: this.name,
            viewport: {
                width:this.viewport.w,
                height:this.viewport.h,
            },
            map_id:(this.map?this.map.id:"")
        }
    }
}
export class EditableDocument extends Observable {
    private palette:ImagePalette
    private sheets:EditableSheet[]
    private maps:EditableMap[]
    private tests:EditableTest[]
    private name:string
    private sprite_lookup:Map<string,EditableSprite>
    constructor() {
        super()
        this.palette = []
        this.sheets = []
        this.maps = []
        this.name = 'unnamed'
        this.sprite_lookup = new Map()
        this.tests = []
    }
    setName(name:string) {
        this.name = name
        this.fire(Changed,this)
    }
    addSheet(sheet:EditableSheet) {
        this.sheets.push(sheet)
        this.fire(Changed,this)
    }
    removeSheet(sheet:EditableSheet) {
        const n = this.sheets.indexOf(sheet)
        if(n < 0) {
            console.warn("cannot remove this sheet")
        } else {
            this.sheets.splice(n,1)
            this.fire(Changed,this)
        }
    }
    getSheets():EditableSheet[] {
        return this.sheets.slice()
    }
    addMap(map:EditableMap){
        this.maps.push(map)
        this.fire(Changed,this)
    }
    removeMap(map:EditableMap) {
        const n = this.maps.indexOf(map)
        if(n < 0) {
            console.warn("cannot remove this map")
        } else {
            this.maps.splice(n,1)
            this.fire(Changed,this)
        }
    }
    getMaps():EditableMap[] {
        return this.maps.slice()
    }
    addTest(test:EditableTest) {
        this.tests.push(test)
        this.fire(Changed,this)
    }
    removeTest(test:EditableTest) {
        const n = this.tests.indexOf(test)
        if(n < 0) {
            console.warn("cannot remove this map")
        } else {
            this.tests.splice(n,1)
            this.fire(Changed,this)
        }
    }
    getTests():EditableTest[] {
        return this.tests.slice()
    }

    setPalette(palette:ImagePalette) {
        this.palette = palette
        this.fire(Changed,this)
    }

    getName() {
        return this.name
    }

    toJSONDoc():JSONDoc {
        const doc:JSONDoc = {
            name:this.getName(),
            color_palette: this.palette,
            version: CURRENT_VERSION,
            sheets: this.sheets.map(sh => sh.toJSONSheet()),
            maps: this.maps.map(mp => mp.toJSONMap()),
            tests: this.tests.map(tst => tst.toJSONTest())
        }
        return doc
    }

    getPalette() {
        return this.palette
    }

    lookup_sprite(id: string) {
        if(this.sprite_lookup.has(id)) return this.sprite_lookup.get(id)
        for(const sheet of this.sheets) {
            for(const sprite of sheet.sprites) {
                if(sprite.id === id) {
                    // console.log("missed the cache",sprite.id)
                    this.sprite_lookup.set(sprite.id,sprite)
                    return sprite
                }
            }
        }
        return null
    }
}

export function make_doc_from_json(raw_data: any) {
    if(raw_data['version'] < 3) throw new Error("we cannot load this document")
    if(raw_data['version'] < 4) {
        raw_data.maps = []
    }
    const json_doc = raw_data as JSONDoc
    if(json_doc.color_palette.length === 0) {
        json_doc.color_palette = PICO8
    }
    const doc = new EditableDocument()
    doc.setName(json_doc.name)
    doc.setPalette(json_doc.color_palette)
    json_doc.sheets.forEach(json_sheet => {
        // log('sheet',json_sheet)
        const sheet = new EditableSheet()
        sheet.id = json_sheet.id
        sheet.setName(json_sheet.name)
        doc.addSheet(sheet)
        json_sheet.sprites.forEach(json_sprite => {
            // log("sprite",json_sprite)
            const sprite = new EditableSprite(json_sprite.w,json_sprite.h,json_doc.color_palette)
            sprite.id = json_sprite.id || genId('sprite')
            sprite.setName(json_sprite.name)
            sprite.data = json_sprite.data
            sprite.rebuild_cache()
            sheet.addSprite(sprite)
        })
    })
    json_doc.maps.forEach(json_map => {
        // log('map',json_map)
        const map = new EditableMap(json_map.width,json_map.height)
        map.id = json_map.id
        map.setName(json_map.name)
        map.cells.set_from_list(json_map.cells)
        doc.addMap(map)
    })
    json_doc.tests.forEach(json_test => {
        // log("test",json_test)
        const test = new EditableTest()
        test.viewport.w = json_test.viewport.width
        test.viewport.h = json_test.viewport.height
        test.id = json_test.id
        test.setName(json_test.name)
        doc.addTest(test)
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
