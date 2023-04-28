import {Point} from "josh_js_util";

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

export const Changed = 'changed'

export class EditableImage extends Observable {
    private w: number;
    private h: number;
    private data: number[];
    private id:string
    private name:string;
    constructor() {
        super();
        this.name = 'unnamed'
        this.id = ''
        this.w = 10
        this.h = 10
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
}

export class EditableSheet extends Observable {
    private sprites: EditableImage[];
    private id:string
    private name:string;
    constructor() {
        super();
        this.sprites = []
        this.name = 'unnamed sheet'
        this.id = ''
    }
    addImage(img: EditableImage) {
        this.sprites.push(img)
        this.fire(Changed,this)
    }
    getImages() {
        return this.sprites.slice()
    }
    getName() {
        return this.name
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
}
export function log(...args: any) {
    console.log(...args)
}
