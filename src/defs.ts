import {ArrayGrid, genId, Point, Size} from "josh_js_util"

import {PropDef, PropsBase, PropValues, UUID} from "./base"
import {
    drawEditableSprite,
    ImagePalette,
    JSONDoc,
    JSONMap,
    JSONSheet,
    JSONSprite,
    JSONTest
} from "./model"

export const NameDef: PropDef<string> = {
    type: 'string',
    editable: true,
    default: () => 'unnamed',
    toJSON: (v: string) => v,
    format: (v) => v,
}
export const SizeDef: PropDef<Size> = {
    type:'Size',
    editable:false,
    default: () => new Size(10,10),
    toJSON: (v) => v.toJSON(),
    format: (v) => `${v.w} x ${v.h}`,
}

const JumpDef: PropDef<number> = {
    type: 'float',
    editable: true,
    default: () => 0.0,
    toJSON: (v: number) => v,
    format: (v) => v.toFixed(2),
}
const ViewportDef: PropDef<Size> = {
    type: 'Size',
    editable: true,
    default: () => new Size(10, 10),
    toJSON: (v: Size) => v.toJSON(),
    format: (v) => `${v.w} x ${v.h}`,
}
const GravityDef: PropDef<Point> = {
    type: 'Point',
    editable: true,
    default: () => new Point(0, 0.1),
    toJSON: (v: Point) => v.toJSON(),
    format: (v) => `${v.x} , ${v.y}`,
}
const MoveSpeedDef: PropDef<number> = {
    type: 'float',
    editable: true,
    default: () => 0.5,
    toJSON: (v: number) => v,
    format: (v) => v.toFixed(2),
}
const MaxFallSpeedDef: PropDef<number> = {
    type: 'float',
    editable: true,
    default: () => 0.5,
    toJSON: (v: number) => v,
    format: (v) => v.toFixed(2),
}
const FrictionDef:PropDef<number> = {
    type:"float",
    default: () => 0.99,
    editable:true,
    toJSON: (v) => v,
    format: (v) => v.toFixed(2),
}
export type TestType = {
    name: string,
    viewport: Size,
    jump_power: number,
    gravity: Point,
    move_speed: number,
    max_fall_speed: number,
    friction: number,
}
export class TestModel extends PropsBase<TestType> {
    constructor() {
        super({
            name:NameDef,
            viewport: ViewportDef,
            jump_power: JumpDef,
            gravity: GravityDef,
            move_speed: MoveSpeedDef,
            max_fall_speed: MaxFallSpeedDef,
            friction: FrictionDef
        })
    }

    static make(): TestModel {
        return new TestModel()
    }

    static fromJSON(json: JSONTest): TestModel {
        console.log(`${this.name}.fromJSON`, json)
        if (!json) throw new Error("null json obj")
        const test = TestModel.make()
        if ('id' in json) test._id = json.id as UUID
        if ('name' in json) test.setPropValue('name', json.name as string)
        if ('viewport' in json) test.setPropValue('viewport', new Size(json.viewport.width, json.viewport.height))
        return test
    }

    toJSONTest():JSONTest {
        return {
            id:this._id,
            name: this.getPropValue('name'),
            viewport: {
                width: this.getPropValue('viewport').w,
                height: this.getPropValue('viewport').h,
            },
        }
    }
}

const CURRENT_VERSION = 4
export type MapCell = {
    tile: string, //id of the sprite used to draw this
}

type DocType = {
    name: string,
}
export class DocModel extends PropsBase<DocType> {
    private palette: ImagePalette
    private sheets: SheetModel[]
    private maps: MapModel[]
    private tests: TestModel[]
    private sprite_lookup: Map<string, SpriteModel>

    constructor() {
        super({
            name: NameDef,
        })
        this.palette = []
        this.sheets = []
        this.maps = []
        this.sprite_lookup = new Map()
        this.tests = []
    }

    addSheet(sheet: SheetModel) {
        this.sheets.push(sheet)
        this._fireAll()
    }

    removeSheet(sheet: SheetModel) {
        const n = this.sheets.indexOf(sheet)
        if (n < 0) {
            console.warn("cannot remove this sheet")
        } else {
            this.sheets.splice(n, 1)
            this._fireAll()
        }
    }

    getSheets(): SheetModel[] {
        return this.sheets.slice()
    }

    addMap(map: MapModel) {
        this.maps.push(map)
        this._fireAll()
    }

    removeMap(map: MapModel) {
        const n = this.maps.indexOf(map)
        if (n < 0) {
            console.warn("cannot remove this map")
        } else {
            this.maps.splice(n, 1)
            this._fireAll()
        }
    }

    getMaps(): MapModel[] {
        return this.maps.slice()
    }

    addTest(test: TestModel) {
        this.tests.push(test)
        this._fireAll()
    }

    removeTest(test: TestModel) {
        const n = this.tests.indexOf(test)
        if (n < 0) {
            console.warn("cannot remove this map")
        } else {
            this.tests.splice(n, 1)
            this._fireAll()
        }
    }

    getTests(): TestModel[] {
        return this.tests.slice()
    }

    setPalette(palette: ImagePalette) {
        this.palette = palette
        this._fireAll()
    }

    toJSONDoc(): JSONDoc {
        return {
            name: this.getPropValue('name'),
            color_palette: this.palette,
            version: CURRENT_VERSION,
            sheets: this.sheets.map(sh => sh.toJSONSheet()),
            maps: this.maps.map(mp => mp.toJSONMap()),
            tests: this.tests.map(tst => tst.toJSONTest())
        }
    }

    getPalette() {
        return this.palette
    }

    lookup_sprite(id: string) {
        if (this.sprite_lookup.has(id)) return this.sprite_lookup.get(id)
        for (const sheet of this.sheets) {
            for (const sprite of sheet.sprites) {
                if (sprite._id === id) {
                    // console.log("missed the cache",sprite.id)
                    this.sprite_lookup.set(sprite._id, sprite)
                    return sprite
                }
            }
        }
        return null
    }
}

export type MapType = {
    name:string,
    size:Size
}

export class MapModel extends PropsBase<MapType> {
    cells: ArrayGrid<MapCell>

    constructor(options?:PropValues<MapType>) {
        super({
            name: NameDef,
            size: SizeDef,
        }, options)
        const size = this.getPropValue('size')
        this.cells = new ArrayGrid<MapCell>(size.w, size.h)
        this.cells.fill(() => ({tile: "nothin"}))
    }

    static fromJSON(json: JSONMap): MapModel {
        console.log("MapImpl.fromJSON", json)
        const map = new MapModel()
        if ('id' in json) map._id = json.id as UUID
        if ('name' in json) map.setPropValue('name', json.name)
        const size = new Size(json.width, json.height)
        map.setPropValue('size', size)
        map.cells = new ArrayGrid<MapCell>(size.w, size.h)
        map.cells.set_from_list(json.cells)
        return map
    }

    toJSONMap():JSONMap {
        return {
            name: this.getPropValue('name'),
            id: this._id,
            width: this.getPropValue('size').w,
            height: this.getPropValue('size').h,
            cells: this.cells.data
        }

    }

}

export type SpriteType = {
    name: string,
    size: Size,
    blocking: boolean
}

const BlockingDef:PropDef<boolean> = {
    type:"boolean",
    editable:true,
    default: () => false,
    toJSON: (v) => v,
    format: (v) => v?'true':'false',
}
export class SpriteModel extends PropsBase<SpriteType> {
    data: ArrayGrid<number>
    palette:ImagePalette
    cache_canvas: HTMLCanvasElement | null
    constructor(w:number, h:number, pallete:ImagePalette) {
        super({
            name:NameDef,
            size:SizeDef,
            blocking: BlockingDef,
        }, {
            size: new Size(w,h),
        })
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
            id: this._id,
            name: this.getPropValue('name'),
            w: this.getPropValue('size').w,
            h: this.getPropValue('size').h,
            blocking: this.getPropValue('blocking'),
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
        const new_tile = new SpriteModel(this.width(),this.height(),this.palette)
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
        const sprite = new SpriteModel(json_sprite.w,json_sprite.h,color_palette)
        sprite._id = json_sprite.id || genId('sprite')
        sprite.setPropValue('name',json_sprite.name)
        sprite.setPropValue('blocking', json_sprite.blocking)
        sprite.data.data = json_sprite.data
        sprite.rebuild_cache()
        return sprite
    }
}

export type SheetType = {
    name: string,
}
export class SheetModel extends PropsBase<SheetType> {
    sprites: SpriteModel[]

    constructor() {
        super({
            name:NameDef,
        })
        this.sprites = []
    }

    addSprite(sprite: SpriteModel) {
        this.sprites.push(sprite)
        this._fireAll()
    }

    removeSprite(sprite: SpriteModel) {
        const n = this.sprites.indexOf(sprite)
        if (n >= 0) {
            this.sprites.splice(n, 1)
            this._fireAll()
        } else {
            console.warn("cannot delete sprite")
        }
    }

    getImages() {
        return this.sprites.slice()
    }

    toJSONSheet(): JSONSheet {
        return {
            name: this.getPropValue('name'),
            id: this._id,
            sprites: this.sprites.map(sp => sp.toJSONSprite())
        }
    }

    static fromJSON(json_sheet: JSONSheet) {
        const sheet = new SheetModel()
        sheet._id = json_sheet.id
        sheet.setPropValue('name', json_sheet.name)
        return sheet
    }
}
