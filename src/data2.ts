import {ArrayGrid, Bounds, Point, Size} from "josh_js_util"

import {PropDef, PropsBase, PropValues} from "./base"
import {BlockingDef, BoundsDef, MapCell, NameDef, PaletteDef, SizeDef, SpriteModel} from "./defs"
import {drawEditableSprite, ImagePalette, JSONSprite} from "./model"

export type TileType = {
    name: string,
    blocking: boolean,
    data: object,
    size: Size,
}
export type Sheet2Type = {
    name: string
    tileSize: Size,
    tiles: Tile2[]
}
export type Layer2Type = {
    name: string,
    type: string,
    blocking: boolean,
    visible: boolean,
}
export type TileLayerType = {
    type: 'tile-layer',
    size: Size,
    data: object,
}
export type ActorLayerType = {
    type: 'actor-layer',
    actors: string[]
}
export type Map2Type = {
    name: string,
    layers: Layer2Type[]
}
export type ActorType = {
    name: string,
    hitbox: Bounds,
    viewbox: Bounds,
}
export type Test2Type = {
    name: string,
    map: string,
    viewport: Size,
}
export type Doc2Type = {
    name: string,
    sheets: Sheet2[]
    maps: Map2[],
    actors: Actor[],
    tests: Test2[]
    palette: ImagePalette,
    tileSize: Size,
}
const GenericDataArrayDef: PropDef<object[]> = {
    type: "array",
    editable: false,
    default: () => [],
    expandable: false,
    format: (v) => 'unknown',
    toJSON: (v) => 'unknown',
    hidden: true,
}

export class Tile2 extends PropsBase<TileType> {
    data: ArrayGrid<number>
    cache_canvas: HTMLCanvasElement | null
    palette: ImagePalette

    constructor(opts?: PropValues<TileType>, palette: ImagePalette) {
        super({
            name: NameDef,
            blocking: BlockingDef,
            data: GenericDataArrayDef,
            size: SizeDef,
        }, opts)
        this.palette = palette
        const size = this.getPropValue('size')
        this.data = new ArrayGrid<number>(size.w, size.h)
        this.data.fill(() => 0)
        this.cache_canvas = null
        this.rebuild_cache()
    }

    setPixel(number: number, point: Point) {
        this.data.set(point, number)
        this.rebuild_cache()
        this._fire('data',this.getPropValue('data'))
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

    toJSONSprite(): JSONSprite {
        return {
            id: this._id,
            name: this.getPropValue('name'),
            w: this.getPropValue('size').w,
            h: this.getPropValue('size').h,
            blocking: this.getPropValue('blocking'),
            data: this.data.data
        }
    }

    isValidIndex(pt: Point) {
        if (pt.x < 0) return false
        if (pt.y < 0) return false
        if (pt.x >= this.data.w) return false
        if (pt.y >= this.data.h) return false
        return true
    }

    clone() {
        const new_tile = new Tile2({size: this.getPropValue('size')}, this.palette)
        new_tile.data.data = this.data.data.slice()
        new_tile.setPropValue('blocking', this.getPropValue('blocking'))
        new_tile.setPropValue('name', this.getPropValue('name'))
        new_tile.setPropValue('size', this.getPropValue('size'))
        new_tile.rebuild_cache()
        return new_tile
    }

    rebuild_cache() {
        this.cache_canvas = document.createElement('canvas')
        this.cache_canvas.width = this.width()
        this.cache_canvas.height = this.height()
        const ctx = this.cache_canvas.getContext('2d') as CanvasRenderingContext2D
        drawEditableSprite(ctx, 1, this)
    }

}

export class Sheet2 extends PropsBase<Sheet2Type> {
    constructor(opts?: PropValues<Sheet2Type>) {
        super({
            name: NameDef,
            tileSize: SizeDef,
            tiles: GenericDataArrayDef,
        }, opts)
    }

    addTile(new_tile: Tile2) {
        this.getPropValue('tiles').push(new_tile)
        this._fire('tiles', this.getPropValue('tiles'))
    }
    removeTile(tile:Tile2) {
        const tiles = this.getPropValue('tiles') as Tile2[]
        const n = tiles.indexOf(tile)
        if (n >= 0) {
            tiles.splice(n, 1)
            this.setPropValue('tiles',tiles.slice())
        } else {
            console.warn("cannot delete sprite")
        }

    }
}

const TileDataGridDef: PropDef<ArrayGrid<MapCell>> = {
    type: 'object',
    editable: false,
    toJSON: () => "unknown",
    format: () => "unreadable",
    default: () => new ArrayGrid<MapCell>(1, 1),
    expandable: false,
    hidden: true,
}
const LayerTypeDef:PropDef<string> = {
    type:'string',
    default: () => 'unknown-type',
    format: (v) => v,
    editable: false,
    toJSON:(v) => v,
}
const Actors2Def: PropDef<ActorType[]> = {
    type: 'array',
    editable: false,
    default: () => [],
    toJSON: (v) => v,
    format: (v) => 'actors list',
    expandable: true
}
const Tests2Def: PropDef<Map2Type[]> = {
    type: 'array',
    editable: false,
    default: () => [],
    toJSON: (v) => v,
    format: (v) => 'tests list',
    expandable: true
}
const Sheets2Def: PropDef<Sheet2Type[]> = {
    type: 'array',
    editable: false,
    default: () => [],
    toJSON: (v) => v,
    format: (v) => 'sheets list',
    expandable: true
}
const Maps2Def: PropDef<Map2Type[]> = {
    type: 'array',
    editable: false,
    default: () => [],
    toJSON: (v) => v,
    format: (v) => 'maps list',
    expandable: true
}

export class TileLayer2 extends PropsBase<TileLayerType> {
    constructor(opts?: PropValues<TileLayerType>) {
        super({
            name: NameDef,
            type: LayerTypeDef,
            blocking: BlockingDef,
            visible: BlockingDef,
            size: SizeDef,
            data: TileDataGridDef,
        }, opts)
        const size = this.getPropValue('size')
        const data = new ArrayGrid<number>(size.w, size.h)
        data.forEach(() => 0)
        this.setPropValue('data', data)
    }
}

export class ActorLayer extends PropsBase<ActorLayerType> {
    constructor(opts?: PropValues<ActorLayerType>) {
        super({
            name: NameDef,
            type: LayerTypeDef,
            blocking: BlockingDef,
            visible: BlockingDef,
            actors: GenericDataArrayDef,
        }, opts)
    }
}

export class Map2 extends PropsBase<Map2Type> {
    constructor(opts?: PropValues<Map2Type>) {
        super({
            name: NameDef,
            layers: GenericDataArrayDef,
        }, opts)
    }
}

export class Actor extends PropsBase<ActorType> {
    constructor(opts?: PropValues<ActorType>) {
        super({
            name: NameDef,
            hitbox: BoundsDef,
            viewbox: BoundsDef,
        }, opts)
    }
}

export class Test2 extends PropsBase<Test2Type> {
    constructor(opts?: PropValues<Test2Type>) {
        super({
            name: NameDef,
            map: NameDef,
            viewport: SizeDef,
        }, opts)
    }
}

export class Doc2 extends PropsBase<Doc2Type> {
    private sprite_lookup: Map<string, Tile2>

    constructor(opts?: PropValues<Doc2Type>) {
        super({
            name: NameDef,
            sheets: Sheets2Def,
            maps: Maps2Def,
            actors: Actors2Def,
            tests: Tests2Def,
            palette: PaletteDef,
            tileSize: SizeDef,
        }, opts)
        this.sprite_lookup = new Map()
    }

    lookup_sprite(id: string) {
        if (this.sprite_lookup.has(id)) return this.sprite_lookup.get(id)
        for (const sheet of this.getPropValue('sheets') as Sheet2[]) {
            for (const tile of sheet.getPropValue('tiles') as Tile2[]) {
                if (tile._id === id) {
                    this.sprite_lookup.set(tile._id, tile)
                    return tile
                }
            }
        }
        console.log("missing", id)
        return null
    }
}


export function appendToList<Type, Key extends keyof Type>(target:PropsBase<Type>, key:Key, value: Type[keyof Type]) {
    let data = target.getPropValue(key) as []
    data = data.slice()
    data.push(value)
    target.setPropValue(key,data)
}
