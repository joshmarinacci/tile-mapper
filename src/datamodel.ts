import {ArrayGrid, Bounds, Point, Size} from "josh_js_util"

import {CLASS_REGISTRY, DefList, PropDef, PropsBase, PropValues, restoreClassFromJSON} from "./base"
import {drawEditableSprite, ImagePalette, PICO8} from "./common"

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
    fromJSON: (v) => Size.fromJSON(v),
    format: (v) => `${v.w} x ${v.h}`,
}
export const PointDef: PropDef<Point> = {
    type:'Point',
    editable:false,
    default: () => new Point(0,0),
    toJSON: (v) => v.toJSON(),
    fromJSON: (v) => Point.fromJSON(v),
    format: (v) => `${v.x} , ${v.y}`,
}
export const BoundsDef: PropDef<Bounds> = {
    type:'Bounds',
    editable:false,
    default: () => new Bounds(0,0,10,10),
    toJSON: (v) => v.toJSON(),
    format: (v) => `${v.w} x ${v.h}`,
    fromJSON: (v) => Bounds.fromJSON(v)
}
export const PaletteDef: PropDef<ImagePalette> = {
    type:'object',
    editable:false,
    default: () => PICO8,
    toJSON: (v) => PICO8,
    format: (v) => 'unknown',
    fromJSON: (v) => v,
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
const CURRENT_VERSION = 4
export type MapCell = {
    tile: string, //id of the sprite used to draw this
}

export const BlockingDef:PropDef<boolean> = {
    type:"boolean",
    editable:true,
    default: () => false,
    toJSON: (v) => v,
    format: (v) => v?'true':'false',
}

const GenericDataArrayDef: PropDef<object[]> = {
    type: "array",
    editable: false,
    default: () => [],
    expandable: false,
    format: (v) => 'unknown',
    toJSON: (v) => v.map(a => {
        if('toJSON' in a) return a.toJSON()
        return a
    }),
    fromJSON: (v) => v.map(a => restoreClassFromJSON(a)),
    hidden: true,
}

type ArrayGridNumberJSON = {
    w:number,
    h:number,
    data:number[]
}
type TileType = {
    name: string,
    blocking: boolean,
    data: ArrayGrid<number>,
    size: Size,
    palette: ImagePalette
}
const TileDataDef:PropDef<ArrayGrid<number>> = {
    type:'array',
    editable: false,
    expandable: false,
    hidden: true,
    default: () => new ArrayGrid<number>(1,1),
    format: (v) => 'array number data',
    toJSON: (v):ArrayGridNumberJSON => ({w:v.w, h:v.h, data:v.data}),
    fromJSON:(value) => {
        const v = value as ArrayGridNumberJSON
        const arr = new ArrayGrid<number>(v.w,v.h)
        arr.data = v.data
        return arr
    }
}
const TileDefs:DefList<TileType> = {
    name: NameDef,
    blocking: BlockingDef,
    data: TileDataDef,
    size: SizeDef,
    palette: PaletteDef,
}
export class Tile extends PropsBase<TileType> {
    cache_canvas: HTMLCanvasElement | null
    constructor(opts?: PropValues<TileType>) {
        super(TileDefs, opts)
        this.cache_canvas = null
        const size = this.getPropValue('size')
        const data = this.getPropValue('data')
        if(data.w !== size.w || data.h !== size.h) {
            // this.log("we must rebuild the data with a new size")
            const data = new ArrayGrid<number>(size.w,size.h)
            data.fill(() => 0)
            this.setPropValue('data',data)
            this.rebuild_cache()
        }
    }

    setPixel(number: number, point: Point) {
        this.getPropValue('data').set(point, number)
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
        return this.getPropValue('data').get(point)
    }

    // toJSONSprite(): JSONSprite {
    //     return {
    //         id: this._id,
    //         name: this.getPropValue('name'),
    //         w: this.getPropValue('size').w,
    //         h: this.getPropValue('size').h,
    //         blocking: this.getPropValue('blocking'),
    //         data: this.data.data
    //     }
    // }

    isValidIndex(pt: Point) {
        if (pt.x < 0) return false
        if (pt.y < 0) return false
        if (pt.x >= this.data().w) return false
        if (pt.y >= this.data().h) return false
        return true
    }

    clone() {
        const new_tile = new Tile({
            size: this.getPropValue('size'),
            palette:this.getPropValue('palette')
        })
        new_tile.getPropValue('data').data = this.data().data.slice()
        new_tile.setPropValue('blocking', this.getPropValue('blocking'))
        new_tile.setPropValue('name', this.getPropValue('name'))
        new_tile.setPropValue('size', this.getPropValue('size'))
        new_tile.rebuild_cache()
        return new_tile
    }

    rebuild_cache() {
        if(typeof document !== 'undefined') {
            // console.log(`rebuilding ${this._id} ${this.getPropValue('name')} with palette is`,this.getPropValue('palette'))
            // console.log(this.getPropValue('data').size())
            this.cache_canvas = document.createElement('canvas')
            this.cache_canvas.width = this.width()
            this.cache_canvas.height = this.height()
            const ctx = this.cache_canvas.getContext('2d') as CanvasRenderingContext2D
            drawEditableSprite(ctx, 1, this)
        }
    }

    private log(...args:unknown[]) {
        console.log(this.constructor.name,...args)
    }

    private data() {
        return this.getPropValue('data')
    }
}
CLASS_REGISTRY.register('Tile',Tile,TileDefs)


type SheetType = {
    name: string
    tileSize: Size,
    tiles: Tile[]
}
const TileArrayDef:PropDef<Tile[]> = {
    type:'array',
    editable:false,
    hidden: true,
    default: () => [],
    toJSON: (v) => v.map(t => t.toJSON()),
    format: (v) => "list of tiles",
    expandable:false,
    fromJSON: (value) => {
        const v = value as any[]
        return v.map(d => restoreClassFromJSON(d))
    }
}
const SheetDefs:DefList<SheetType> = {
    name: NameDef,
    tileSize: SizeDef,
    tiles: TileArrayDef,
}
export class Sheet extends PropsBase<SheetType> {
    constructor(opts?: PropValues<SheetType>) {
        super(SheetDefs, opts)
    }
    addTile(new_tile: Tile) {
        this.getPropValue('tiles').push(new_tile)
        this._fire('tiles', this.getPropValue('tiles'))
    }
    removeTile(tile:Tile) {
        const tiles = this.getPropValue('tiles') as Tile[]
        const n = tiles.indexOf(tile)
        if (n >= 0) {
            tiles.splice(n, 1)
            this.setPropValue('tiles',tiles.slice())
        } else {
            console.warn("cannot delete sprite")
        }

    }
}
CLASS_REGISTRY.register('Sheet',Sheet,SheetDefs)





const LayerTypeDef:PropDef<string> = {
    type:'string',
    default: () => 'unknown-type',
    format: (v) => v,
    editable: false,
    toJSON:(v) => v,
    fromJSON: (v) => v,
}
type ArrayGridMapCellJSON = {
    w:number,
    h:number,
    data:MapCell[]
}
const TileDataGridDef: PropDef<ArrayGrid<MapCell>> = {
    type: 'object',
    editable: false,
    toJSON: (v) => ({
            w:v.w,
            h:v.h,
            data: v.data,
        } as ArrayGridMapCellJSON),
    format: (v) => `${v.size()} cells`,
    default: () => new ArrayGrid<MapCell>(1, 1),
    fromJSON:(value) => {
        const v = value as ArrayGridNumberJSON
        const arr = new ArrayGrid<MapCell>(v.w,v.h)
        arr.data = v.data
        return arr
    },
    expandable: false,
    hidden: true,
}
type TileLayerType = {
    name: string,
    type: 'tile-layer',
    blocking:boolean,
    visible:boolean,
    size: Size,
    data: ArrayGrid<MapCell>,
    wrapping: boolean,
    scrollSpeed: number,
}
const BooleanDef:PropDef<boolean> = {
    type:'boolean',
    hidden:false,
    editable:true,
    expandable:false,
    default: () => true,
    format:(v)=>v?'true':'false',
    toJSON:(v) => v,
    fromJSON:(v) => v as boolean,
}
const NumberDef:PropDef<number> = {
    type:'float',
    hidden:false,
    editable:true,
    expandable:false,
    default: () => 0.0,
    format:(v)=>v.toFixed(2),
    toJSON:(v) => v,
    fromJSON:(v) => v as number,
}
const TileLayerDefs:DefList<TileLayerType> = {
    name: NameDef,
    type: LayerTypeDef,
    blocking: BlockingDef,
    visible: BlockingDef,
    size: SizeDef,
    data: TileDataGridDef,
    wrapping: BooleanDef,
    scrollSpeed:NumberDef,
}
export class TileLayer extends PropsBase<TileLayerType> {
    constructor(opts?: PropValues<TileLayerType>) {
        super(TileLayerDefs, opts)
        const size = this.getPropValue('size')
        const data = this.getPropValue('data')
        if(data.w !== size.w || data.h !== size.h) {
            // this.log("we must rebuild the data with a new size")
            const data = new ArrayGrid<MapCell>(size.w,size.h)
            data.fill(() => ({tile:'unknown'}))
            this.setPropValue('data',data)
        }
    }
}
CLASS_REGISTRY.register('TileLayer',TileLayer,TileLayerDefs)

type ActorLayerType = {
    type: 'actor-layer',
    actors: string[]
}
const ActorLayerDefs:DefList<ActorLayerType> = {
    name: NameDef,
    type: LayerTypeDef,
    blocking: BlockingDef,
    visible: BlockingDef,
    actors: GenericDataArrayDef,
}
export class ActorLayer extends PropsBase<ActorLayerType> {
    constructor(opts?: PropValues<ActorLayerType>) {
        super(ActorLayerDefs, opts)
    }
}
CLASS_REGISTRY.register('ActorLayer',ActorLayer, ActorLayerDefs)

export type Layer2Type = {
    name: string,
    type: string,
    blocking: boolean,
    visible: boolean,
}
type Map2Type = {
    name: string,
    layers: Layer2Type[]
}
const GameMapDefs:DefList<Map2Type> = {
    name: NameDef,
    layers: GenericDataArrayDef,
}
export class GameMap extends PropsBase<Map2Type> {
    constructor(opts?: PropValues<Map2Type>) {
        super(GameMapDefs, opts)
    }

    calcBiggestLayer() {
        const biggest = new Size(0, 0)
        this.getPropValue('layers').forEach(layer => {
            if (layer instanceof TileLayer) {
                const size = layer.getPropValue('size')
                if (size.w > biggest.w) biggest.w = size.w
                if (size.h > biggest.h) biggest.h = size.h
            }
        })
        return biggest
    }
}
CLASS_REGISTRY.register('Map',GameMap,GameMapDefs)

type ActorType = {
    name: string,
    hitbox: Bounds,
    viewbox: Bounds,
}
const ActorDefs:DefList<ActorType> = {
    name: NameDef,
    hitbox: BoundsDef,
    viewbox: BoundsDef,
}
export class Actor extends PropsBase<ActorType> {
    constructor(opts?: PropValues<ActorType>) {
        super(ActorDefs, opts)
    }
}
CLASS_REGISTRY.register('Actor',Actor,ActorDefs)

const EditableSizeDef: PropDef<Size> = {
    type:'Size',
    editable:true,
    hidden:false,
    default: () => new Size(10,10),
    toJSON: (v) => v.toJSON(),
    fromJSON: (v) => Size.fromJSON(v),
    format: (v) => `${v.w} x ${v.h}`,
}

type TestType = {
    name: string,
    map: string,
    viewport: Size,
}
const TestDefs:DefList<TestType> = {
    name: NameDef,
    map: NameDef,
    viewport: EditableSizeDef,
}
export class GameTest extends PropsBase<TestType> {
    constructor(opts?: PropValues<TestType>) {
        super(TestDefs, opts)
    }
}
CLASS_REGISTRY.register('GameTest',GameTest, TestDefs)

const ActorsListDef: PropDef<Actor[]> = {
    type: 'array',
    editable: false,
    default: () => [],
    toJSON: (v) => v.map(actor => actor.toJSON()),
    format: (v) => 'actors list',
    fromJSON:(v => v.map(a => restoreClassFromJSON(a))),
    expandable: true,
    hidden:true,
}
const TestsListDef: PropDef<GameTest[]> = {
    type: 'array',
    editable: false,
    hidden:true,
    default: () => [],
    format: (v) => 'tests list',
    toJSON: (v) => v.map(n => n.toJSON()),
    fromJSON:(v => v.map(a => restoreClassFromJSON(a))),
    expandable: true
}
const SheetsListDef: PropDef<Sheet[]> = {
    type: 'array',
    editable: false,
    hidden:true,
    default: () => [],
    toJSON: (v) => v.map(sheet => sheet.toJSON()),
    format: (v) => 'sheets list',
    fromJSON: (v) => v.map(sheet => restoreClassFromJSON(sheet)),
    expandable: true
}
const MapsListDef: PropDef<GameMap[]> = {
    type: 'array',
    editable: false,
    hidden:true,
    default: () => [],
    toJSON: (v) => v.map(map => map.toJSON()),
    format: (v) => 'maps list',
    fromJSON:(v => v.map(map => restoreClassFromJSON(map))),
    expandable: true
}
type Doc2Type = {
    name: string,
    sheets: Sheet[]
    maps: GameMap[],
    actors: Actor[],
    tests: GameTest[]
    palette: ImagePalette,
    tileSize: Size,
}
const GameDocDefs:DefList<Doc2Type> = {
    name: NameDef,
    sheets: SheetsListDef,
    maps: MapsListDef,
    actors: ActorsListDef,
    tests: TestsListDef,
    palette: PaletteDef,
    tileSize: SizeDef,
}
export class GameDoc extends PropsBase<Doc2Type> {
    private sprite_lookup: Map<string, Tile>

    constructor(opts?: PropValues<Doc2Type>) {
        super(GameDocDefs, opts)
        this.sprite_lookup = new Map()
    }

    lookup_sprite(id: string) {
        if (this.sprite_lookup.has(id)) return this.sprite_lookup.get(id)
        for (const sheet of this.getPropValue('sheets') as Sheet[]) {
            for (const tile of sheet.getPropValue('tiles') as Tile[]) {
                if (tile._id === id) {
                    console.log("caching",id,tile.getPropValue('name'), tile.cache_canvas)
                    tile.rebuild_cache()
                    this.sprite_lookup.set(tile._id, tile)
                    return tile
                }
            }
        }
        console.log("missing", id)
        return null
    }
}
CLASS_REGISTRY.register('Doc',GameDoc,GameDocDefs)


