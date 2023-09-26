import {ArrayGrid, Bounds, Point, Size} from "josh_js_util"

import {CLASS_REGISTRY, DefList, PropDef, PropsBase, PropValues, restoreClassFromJSON} from "./base"
import {drawEditableSprite, ImagePalette, PICO8} from "./common"

export const BooleanDef:PropDef<boolean> = {
    type:'boolean',
    hidden:false,
    editable:true,
    expandable:false,
    default: () => true,
    format:(v)=>v?'true':'false',
    toJSON:(v) => v,
    fromJSON:(v) => v as boolean,
}
export const FloatDef:PropDef<number> = {
    type:'float',
    hidden:false,
    editable:true,
    expandable:false,
    default: () => 0.0,
    format:(v)=>v.toFixed(2),
    toJSON:(v) => v,
    fromJSON:(v) => v as number,
}
export const IntegerDef:PropDef<number> = {
    type:'integer',
    hidden:false,
    editable:true,
    expandable:false,
    default: () => 0,
    format:(v)=>v.toFixed(0),
    toJSON:(v) => v,
    fromJSON:(v) => v as number,
}
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
    fromJSON: (v) => Size.fromJSON(v as {w:number, h:number}),
    format: (v) => `${v.w} x ${v.h}`,
}
export const PointDef: PropDef<Point> = {
    type:'Point',
    editable:false,
    default: () => new Point(0,0),
    toJSON: (v) => v.toJSON(),
    fromJSON: (v) => Point.fromJSON(v as{x:number, y:number}),
    format: (v) => `${v.x} , ${v.y}`,
}
export const BoundsDef: PropDef<Bounds> = {
    type:'Bounds',
    editable:false,
    hidden:false,
    default: () => new Bounds(0,0,10,10),
    toJSON: (v) => v.toJSON(),
    format: (v) => `${v.w} x ${v.h}`,
    fromJSON: (v) => Bounds.fromJSON(v as {x:number, y:number, w:number, h:number})
}
export const EditableBoundsDef: PropDef<Bounds> = {
    type:'Bounds',
    editable:true,
    hidden:false,
    default: () => new Bounds(0,0, 16,16),
    toJSON: (v) => v.toJSON(),
    fromJSON: (v) => Bounds.fromJSON(v as {x:number, y:number, w:number, h:number}),
    format: (v) => `${v.x}, ${v.y} -> ${v.w} x ${v.h}`,
}
export const PaletteDef: PropDef<ImagePalette> = {
    type:'object',
    editable:false,
    default: () => PICO8,
    toJSON: (v) => v,
    format: () => 'unknown',
    fromJSON: (v) => v as ImagePalette,
}

const JumpDef: PropDef<number> = {
    type: 'float',
    editable: true,
    default: () => -5,
    toJSON: (v: number) => v,
    format: (v) => v.toFixed(2),
}
const GravityDef: PropDef<number> = {
    type: 'float',
    editable: true,
    default: () => 0.2,
    toJSON: (v) => v,
    format: (v) => v.toFixed(2),
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
    format: () => 'unknown',
    toJSON: (v) => v.map(a => {
        if('toJSON' in a) return (a.toJSON() as unknown as object)
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


export type MapLayerType = {
    name: string,
    type: string,
    blocking: boolean,
    visible: boolean,
}
type TileMapLayerType = {
    type: 'tile-layer',
    size: Size,
    data: ArrayGrid<MapCell>,
    wrapping: boolean,
    scrollSpeed: number,
} & MapLayerType
type ActorMapLayerType = {
    type: 'actor-layer',
    actors:ActorInstance[]
} & MapLayerType


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
const TileLayerDefs:DefList<TileMapLayerType> = {
    name: NameDef,
    type: {
        type:"string",
        default: () => 'tile-layer',
        toJSON: v => v,
        format: v => v,
        fromJSON: (v) => v,
        editable: false,
        hidden: false,
        expandable: false,
    } as PropDef<string>,
    blocking: BlockingDef,
    visible: BlockingDef,
    size: SizeDef,
    data: TileDataGridDef,
    wrapping: BooleanDef,
    scrollSpeed:FloatDef,
}
export class TileLayer extends PropsBase<TileMapLayerType> {
    constructor(opts?: PropValues<TileMapLayerType>) {
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

const ActorLayerDefs:DefList<ActorMapLayerType> = {
    name: NameDef,
    type: {
        type:"string",
        default: () => 'actor-layer',
        toJSON: v => v,
        format: v => v,
        fromJSON: (v) => v,
        editable: false,
        hidden: false,
        expandable: false,
    } as PropDef<string>,
    blocking: BlockingDef,
    visible: BlockingDef,
    actors: GenericDataArrayDef,
}
export class ActorLayer extends PropsBase<ActorMapLayerType> {
    constructor(opts?: PropValues<ActorMapLayerType>) {
        super(ActorLayerDefs, opts)
    }
}
CLASS_REGISTRY.register('ActorLayer',ActorLayer, ActorLayerDefs)

type GameMapType = {
    name: string,
    layers: PropsBase<any>[]
}
const LayerListDef:PropDef<PropsBase<any>[]> = {
    type:"array",
    editable:false,
    expandable: false,
    default: () => [],
    hidden: true,
    format: (v) => "layers",
    watchChildren:true,
    toJSON: (v) => v.map(a => {
        if ('toJSON' in a) return a.toJSON()
        return a
    }),
    fromJSON: (v) => v.map(a => restoreClassFromJSON(a)),
}
const GameMapDefs:DefList<GameMapType> = {
    name: NameDef,
    layers: LayerListDef,
}
export class GameMap extends PropsBase<GameMapType> {
    constructor(opts?: PropValues<GameMapType>) {
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
    tile: string|undefined,
}
const ActorDefs:DefList<ActorType> = {
    name: NameDef,
    hitbox: EditableBoundsDef,
    viewbox: EditableBoundsDef,
    tile: {
        type:'reference',
        custom:'tile-reference',
        editable:true,
        hidden:false,
        expandable:false,
        default: () => undefined,
        format:(v) => v?v:'unknown',
    }
}
export class Actor extends PropsBase<ActorType> {
    constructor(opts?: PropValues<ActorType>) {
        super(ActorDefs, opts)
    }
}
CLASS_REGISTRY.register('Actor',Actor,ActorDefs)

type ActorInstanceType = {
    name:string,
    actor:string,
    position:Point,
}
const ActorInstanceDefs:DefList<ActorInstanceType> = {
    name: NameDef,
    position:PointDef,
    actor: {
        type:"string",
        default: () => "unknown",
        expandable:false,
        hidden:false,
        editable:false,
        format: (v) => v,
    },
}
export class ActorInstance extends PropsBase<ActorInstanceType> {
    constructor(opts?: PropValues<ActorInstanceType>) {
        super(ActorInstanceDefs, opts)
    }
}
CLASS_REGISTRY.register('ActorInstance',ActorInstance,ActorInstanceDefs)

const EditableSizeDef: PropDef<Size> = {
    type:'Size',
    editable:true,
    hidden:false,
    default: () => new Size(10,10),
    toJSON: (v) => v.toJSON(),
    fromJSON: (v) => Size.fromJSON(v),
    format: (v) => `${v.w} x ${v.h}`,
}


const ViewportDef: PropDef<Size> = {
    type: 'Size',
    editable: true,
    hidden:false,
    default: () => new Size(10, 10),
    toJSON: (v: Size) => v.toJSON(),
    fromJSON: (v) => Size.fromJSON(v),
    format: (v) => `${v.w} x ${v.h}`,
}
type TestType = {
    name: string,
    map: string,
    viewport: Size,
    gravity: number,
    jump_power: number,
    move_speed: number,
    move_speed_max: number,
    friction: number,
}
const TestDefs:DefList<TestType> = {
    name: NameDef,
    map: NameDef,
    viewport: ViewportDef,
    gravity: GravityDef,
    jump_power: JumpDef,
    move_speed: FloatDef,
    move_speed_max: FloatDef,
    friction: FloatDef,
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
export type DocType = {
    name: string,
    sheets: Sheet[]
    maps: GameMap[],
    actors: Actor[],
    tests: GameTest[]
    palette: ImagePalette,
    tileSize: Size,
}
const GameDocDefs:DefList<DocType> = {
    name: NameDef,
    sheets: SheetsListDef,
    maps: MapsListDef,
    actors: ActorsListDef,
    tests: TestsListDef,
    palette: PaletteDef,
    tileSize: SizeDef,
}
export class GameDoc extends PropsBase<DocType> {
    private sprite_lookup: Map<string, Tile>

    constructor(opts?: PropValues<DocType>) {
        super(GameDocDefs, opts)
        this.sprite_lookup = new Map()
    }

    lookup_sprite(id: string) {
        if (this.sprite_lookup.has(id)) return this.sprite_lookup.get(id)
        for (const sheet of this.getPropValue('sheets') as Sheet[]) {
            for (const tile of sheet.getPropValue('tiles') as Tile[]) {
                if (tile._id === id) {
                    // console.log("caching",id,tile.getPropValue('name'), tile.cache_canvas)
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


