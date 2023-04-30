import {genId, Point} from "josh_js_util";

export const PICO8 = [
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
export type ImagePalette = string[]
type Etype = string
type ObservableListener = (type: Etype) => void

export class Observable {
    private listeners: Map<Etype, Array<ObservableListener>>

    constructor() {
        this.listeners = new Map<Etype, Array<ObservableListener>>();
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
export type JSONDoc = {
    color_palette:string[]
    sheets:JSONSheet[],
    version:number,
    name:string
}
export const Changed = 'changed'

export class EditableSprite extends Observable {
    private w: number;
    private h: number;
    data: number[];
    private id:string
    private name:string;
    palette:ImagePalette;
    constructor(w:number, h:number, pallete:ImagePalette) {
        super();
        this.name = 'unnamed'
        this.id = genId('tile')
        this.palette = pallete
        this.w = w
        this.h = h
        this.data = []
        for (let k = 0; k < this.w * this.h; k++) {
            this.data[k] = 0
        }
    }
    setPixel(number: number, point: Point) {
        let n = point.x + point.y * this.w
        this.data[point.x + point.y * this.w] = number
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
        let new_tile = new EditableSprite(this.width(),this.height(),this.palette)
        new_tile.data = this.data.slice()
        return new_tile
    }
}

export class EditableSheet extends Observable {
    sprites: EditableSprite[];
    id:string
    private name:string;
    constructor() {
        super();
        this.sprites = []
        this.name = 'unnamed sheet'
        this.id = genId('sheet')
    }
    addSprite(img: EditableSprite) {
        this.sprites.push(img)
        this.fire(Changed,this)
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

export class EditableDocument extends Observable {
    private palette:ImagePalette
    private sheets:EditableSheet[]
    private name:string
    constructor() {
        super();
        this.palette = []
        this.sheets = []
        this.name = 'unnamed'
    }
    setName(name:string) {
        this.name = name
        this.fire(Changed,this)
    }
    addSheet(sheet:EditableSheet) {
        this.sheets.push(sheet)
        this.fire(Changed,this)
    }
    getSheets() {
        return this.sheets.slice()
    }
    setPalette(palette:ImagePalette) {
        this.palette = palette
        this.fire(Changed,this)
    }

    getName() {
        return this.name
    }

    toJSONDoc():JSONDoc {
        let doc:JSONDoc = {
            name:this.getName(),
            color_palette: this.palette,
            version: 3,
            sheets: this.sheets.map(sh => sh.toJSONSheet())
        }
        return doc
    }
}

export function make_doc_from_json(raw_data: any) {
    if(raw_data['version'] !== 3) throw new Error("we cannot load this document")
    let json_doc = raw_data as JSONDoc
    let doc = new EditableDocument()
    doc.setName(json_doc.name)
    doc.setPalette(json_doc.color_palette)
    json_doc.sheets.forEach(json_sheet => {
        log(json_sheet)
        let sheet = new EditableSheet()
        sheet.id = json_sheet.id
        sheet.setName(json_sheet.name)
        doc.addSheet(sheet)
        json_sheet.sprites.forEach(json_sprite => {
            log("sprite",json_sprite)
            let sprite = new EditableSprite(json_sprite.w,json_sprite.h,json_doc.color_palette)
            sprite.setName(json_sprite.name)
            sprite.data = json_sprite.data
            sheet.addSprite(sprite)
        })
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
    let str = JSON.stringify(toJsonObj, null, '   ');
    return new Blob([str]);
}

export function drawEditableSprite(ctx: CanvasRenderingContext2D, scale: number, image: EditableSprite) {
    for (let i = 0; i < image.width(); i++) {
        for (let j = 0; j < image.height(); j++) {
            let v: number = image.getPixel(new Point(i, j))
            ctx.fillStyle = image.palette[v]
            ctx.fillRect(i * scale, j * scale, scale, scale)
        }
    }
}
