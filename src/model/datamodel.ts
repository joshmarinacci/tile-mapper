import {ArrayGrid, Bounds, Point, Size} from "josh_js_util"

import {drawEditableSprite, ImagePalette, PICO8, RESURRECT64} from "../common/common"
import {CLASS_REGISTRY, DefList, PropDef, PropsBase, PropValues, restoreClassFromJSON} from "./base"

export const BooleanDef:PropDef<boolean> = {
    type:'boolean',
    hidden:false,
    editable:true,
    expandable:false,
    default: () => true,
    format:(v)=>v?'true':'false',
    toJSON:(v) => v,
    fromJSON:(v) => v as boolean,
    watchChildren:false,
}
export const FloatDef:PropDef<number> = {
    type:'float',
    hidden:false,
    editable:true,
    expandable:false,
    watchChildren:false,
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
    watchChildren:false,
    default: () => 0,
    format:(v)=>v.toFixed(0),
    toJSON:(v) => v,
    fromJSON:(v) => v as number,
}
export const NameDef: PropDef<string> = {
    type: 'string',
    editable: true,
    watchChildren:false,
    hidden: false,
    expandable: false,
    fromJSON: (v) => v as string,
    default: () => 'unnamed',
    toJSON: (v: string) => v,
    format: (v) => v,
}
export const SizeDef: PropDef<Size> = {
    type:'Size',
    editable:false,
    hidden: false,
    expandable: false,
    watchChildren: false,
    default: () => new Size(10,10),
    toJSON: (v) => v.toJSON(),
    fromJSON: (v) => Size.fromJSON(v as {w:number, h:number}),
    format: (v) => `${v.w} x ${v.h}`,
}
export const PointDef: PropDef<Point> = {
    type:'Point',
    editable:false,
    hidden: false,
    expandable: false,
    watchChildren: false,
    default: () => new Point(0,0),
    toJSON: (v) => v.toJSON(),
    fromJSON: (v) => Point.fromJSON(v as{x:number, y:number}),
    format: (v) => `${v.x} , ${v.y}`,
}
export const BoundsDef: PropDef<Bounds> = {
    type:'Bounds',
    editable:false,
    hidden:false,
    expandable: false,
    watchChildren: false,
    default: () => new Bounds(0,0,10,10),
    toJSON: (v) => v.toJSON(),
    format: (v) => `${v.w} x ${v.h}`,
    fromJSON: (v) => Bounds.fromJSON(v as {x:number, y:number, w:number, h:number})
}
export const EditableBoundsDef: PropDef<Bounds> = {
    type:'Bounds',
    editable:true,
    hidden:false,
    expandable: false,
    watchChildren: false,
    default: () => new Bounds(0,0, 16,16),
    toJSON: (v) => v.toJSON(),
    fromJSON: (v) => Bounds.fromJSON(v as {x:number, y:number, w:number, h:number}),
    format: (v) => `${v.x}, ${v.y} -> ${v.w} x ${v.h}`,
}
export const PaletteDef: PropDef<ImagePalette> = {
    type:'object',
    hidden:false,
    editable:false,
    expandable: false,
    watchChildren: false,
    default: () => PICO8,
    toJSON: (v) => v,
    format: (v) => v.name,
    fromJSON: (v) => {
        if('name' in v) {
            return v as ImagePalette
        } else {
            if( v.length === 64) return RESURRECT64
            if( v.length === 17) return PICO8
            return {
                name:'unknow',
                colors:v as string[]
            } as ImagePalette
        }
    },
}

const JumpDef: PropDef<number> = {
    type: 'float',
    editable: true,
    hidden: false,
    watchChildren: false,
    expandable: false,
    default: () => -5,
    toJSON: (v: number) => v,
    fromJSON: (v) => v as number,
    format: (v) => v.toFixed(2),
}
const GravityDef: PropDef<number> = {
    type: 'float',
    editable: true,
    hidden: false,
    watchChildren: false,
    expandable: false,
    default: () => 0.2,
    toJSON: (v) => v,
    fromJSON: (v) => v as number,
    format: (v) => v.toFixed(2),
}
const MoveSpeedDef: PropDef<number> = {
    type: 'float',
    editable: true,
    hidden: false,
    watchChildren: false,
    expandable: false,
    default: () => 0.5,
    toJSON: (v: number) => v,
    fromJSON: (v) => v as number,
    format: (v) => v.toFixed(2),
}
const MaxFallSpeedDef: PropDef<number> = {
    type: 'float',
    editable: true,
    hidden: false,
    watchChildren: false,
    expandable: false,
    default: () => 0.5,
    toJSON: (v: number) => v,
    fromJSON: (v) => v as number,
    format: (v) => v.toFixed(2),
}
const FrictionDef:PropDef<number> = {
    type:"float",
    default: () => 0.99,
    editable:true,
    hidden: false,
    watchChildren: false,
    expandable: false,
    toJSON: (v) => v,
    fromJSON: (v) => v as number,
    format: (v) => v.toFixed(2),
}
export type MapCell = {
    tile: string, //id of the sprite used to draw this
}

export const BlockingDef:PropDef<boolean> = {
    type:"boolean",
    editable:true,
    hidden: false,
    watchChildren: false,
    expandable: false,
    default: () => false,
    toJSON: (v) => v,
    fromJSON: (v) => v as boolean,
    format: (v) => v?'true':'false',
}

const GenericDataArrayDef: PropDef<object[]> = {
    type: "array",
    editable: false,
    default: () => [],
    expandable: false,
    watchChildren: false,
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
}
const TileDataDef:PropDef<ArrayGrid<number>> = {
    type:'array',
    editable: false,
    expandable: false,
    hidden: true,
    watchChildren: false,
    default: () => new ArrayGrid<number>(1,1),
    format: () => 'array number data',
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
}
export class Tile extends PropsBase<TileType> {
    constructor(opts?: PropValues<TileType>) {
        super(TileDefs, opts)
        const size = this.getPropValue('size')
        const data = this.getPropValue('data')
        if(data.w !== size.w || data.h !== size.h) {
            // this.log("we must rebuild the data with a new size")
            const data = new ArrayGrid<number>(size.w,size.h)
            data.fill(() => 0)
            this.setPropValue('data',data)
        }
    }

    setPixel(number: number, point: Point) {
        this.getPropValue('data').set(point, number)
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
            })
        new_tile.getPropValue('data').data = this.data().data.slice()
        new_tile.setPropValue('blocking', this.getPropValue('blocking'))
        new_tile.setPropValue('name', this.getPropValue('name'))
        new_tile.setPropValue('size', this.getPropValue('size'))
        return new_tile
    }

    private log(...args:unknown[]) {
        console.log(this.constructor.name,...args)
    }

    private data() {
        return this.getPropValue('data')
    }
}
CLASS_REGISTRY.register('Tile',Tile,TileDefs)

type SImageLayerType = {
    name: string,
    visible: boolean,
    opacity: number,
    data: ArrayGrid<number>,
}
const SImageLayerDataPropDef:PropDef<ArrayGrid<number>> = {
    type:'array',
    editable: false,
    expandable: false,
    hidden: true,
    watchChildren: false,
    default: () => new ArrayGrid<number>(1,1),
    format: () => 'array number data',
    toJSON: (v):ArrayGridNumberJSON => ({w:v.w, h:v.h, data:v.data}),
    fromJSON:(value) => {
        const v = value as ArrayGridNumberJSON
        const arr = new ArrayGrid<number>(v.w,v.h)
        arr.data = v.data
        return arr
    }
}
const SImageLayerDataDefs:DefList<SImageLayerType> = {
    name: NameDef,
    visible: BooleanDef,
    opacity: FloatDef,
    data: SImageLayerDataPropDef,
}
export class SImageLayer extends PropsBase<SImageLayerType> {
    constructor(opts?: PropValues<SImageLayerType>) {
        super(SImageLayerDataDefs, opts)
    }

    rebuildFromCanvas(canvas: SImage) {
        const size = canvas.getPropValue('size')
        const data = new ArrayGrid<number>(size.w,size.h)
        data.fill(()=>-1)
        this.setPropValue('data',data)
    }

    setPixel(pt: Point, color: number) {
        this.getPropValue('data').set(pt, color)
        this._fire('data',this.getPropValue('data'))
        this._fireAll()
    }

    getPixel(pt: Point):number {
        return this.getPropValue('data').get(pt)
    }

    fillAll(number: number) {
        this.getPropValue('data').fill(() => number)
        this._fire('data',this.getPropValue('data'))
        this._fireAll()
    }
}
CLASS_REGISTRY.register('SImageLayer',SImageLayer,SImageLayerDataDefs)

type SImageType = {
    name: string,
    layers: SImageLayer[],
    size: Size,
}
const SImageDefs:DefList<SImageType> = {
    name: NameDef,
    layers: {
        type:'array',
        default: () => [],
        editable:false,
        expandable:false,
        hidden:true,
        watchChildren:true,
        format: (v:SImageLayer[]) => `${v.length} layers`,
        toJSON: (v:SImageLayer[]) => v.map(a => a.toJSON?a.toJSON():a),
        fromJSON: (v) => v.map(a => restoreClassFromJSON(a)),
    },
    size: SizeDef,
}
export class SImage extends PropsBase<SImageType> {
    constructor(opts?: PropValues<SImageType>) {
        super(SImageDefs, opts)
    }
}
CLASS_REGISTRY.register('SImage',SImage, SImageDefs)


type SheetType = {
    name: string
    tileSize: Size,
    tiles: Tile[],
    selectedTile: Tile|undefined,
    showNames:boolean,
    showGrid:boolean,
}
const TileArrayDef:PropDef<Tile[]> = {
    type:'array',
    editable:false,
    hidden: true,
    expandable:false,
    watchChildren: true,
    default: () => [],
    toJSON: (v) => v.map(t => t.toJSON()),
    format: (v) => "list of tiles",
    fromJSON: (value) => {
        const v = value as []
        return v.map(d => restoreClassFromJSON(d)) as Tile[]
    }
}
export const TransientBooleanDef:PropDef<boolean> = {
    type:'boolean',
    hidden:false,
    editable:true,
    expandable:false,
    default: () => true,
    format:(v)=>v?'true':'false',
    toJSON:(v) => v,
    fromJSON:(v) => v as boolean,
    watchChildren:false,
    skipPersisting: true,
}

const SheetDefs:DefList<SheetType> = {
    name: NameDef,
    tileSize: SizeDef,
    tiles: TileArrayDef,
    selectedTile: {
        type:'object',
        hidden: true,
        default: () => undefined,
        expandable: false,
        editable: false,
        watchChildren: false,
        skipPersisting: true,
    },
    showNames: TransientBooleanDef,
    showGrid: TransientBooleanDef,

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
    watchChildren: false,
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
        toJSON:(v) => v,
        fromJson:(v) => v,
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
    expandable: false,
    watchChildren: false,
    default: () => new Size(10,10),
    toJSON: (v) => v.toJSON(),
    fromJSON: (v) => Size.fromJSON(v),
    format: (v) => `${v.w} x ${v.h}`,
}


const ViewportDef: PropDef<Size> = {
    type: 'Size',
    editable: true,
    hidden:false,
    expandable: false,
    watchChildren: false,
    default: () => new Size(10, 10),
    toJSON: (v: Size) => v.toJSON(),
    fromJSON: (v) => Size.fromJSON(v as {w:number, h:number}),
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
    watchChildren: false,
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
    watchChildren: false,
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
    watchChildren: false,
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
    watchChildren: false,
    default: () => [],
    toJSON: (v) => v.map(map => map.toJSON()),
    format: (v) => 'maps list',
    fromJSON:(v => v.map(map => restoreClassFromJSON(map))),
    expandable: true
}
const CanvasesListDef:PropDef<SImage[]> = {
    type: "array",
    editable: false,
    hidden: true,
    watchChildren: false,
    default: () => [],
    toJSON: (v) => v.map(map => map.toJSON()),
    format: (v) => 'canvases list',
    fromJSON:(v => v.map(map => restoreClassFromJSON(map))),
    expandable: true
}

export type DocType = {
    name: string,
    sheets: Sheet[]
    maps: GameMap[],
    actors: Actor[],
    tests: GameTest[],
    canvases: SImage[],
    palette: ImagePalette,
    tileSize: Size,
}
const GameDocDefs:DefList<DocType> = {
    name: NameDef,
    sheets: SheetsListDef,
    maps: MapsListDef,
    actors: ActorsListDef,
    tests: TestsListDef,
    canvases: CanvasesListDef,
    palette: PaletteDef,
    tileSize: SizeDef,
}

export function gen_canvas(tile: Tile, palette: ImagePalette) {
    const cache_canvas = document.createElement('canvas')
    cache_canvas.width = tile.getPropValue('size').w
    cache_canvas.height = tile.getPropValue('size').h
    const ctx = cache_canvas.getContext('2d') as CanvasRenderingContext2D
    drawEditableSprite(ctx, 1, tile, palette)
    return cache_canvas
}

export class GameDoc extends PropsBase<DocType> {
    private sprite_lookup: Map<string, Tile>
    private sprite_lookup_by_name: Map<string, Tile>
    private image_cache: Map<Tile,HTMLCanvasElement>

    constructor(opts?: PropValues<DocType>) {
        super(GameDocDefs, opts)
        this.sprite_lookup = new Map()
        this.sprite_lookup_by_name = new Map()
        this.image_cache = new Map()
    }

    lookup_sprite(id: string) {
        if (this.sprite_lookup.has(id)) return this.sprite_lookup.get(id)
        for (const sheet of this.getPropValue('sheets') as Sheet[]) {
            for (const tile of sheet.getPropValue('tiles') as Tile[]) {
                if (tile._id === id) {
                    this.sprite_lookup.set(tile._id, tile)
                    return tile
                }
            }
        }
        console.log("missing", id)
        return null
    }
    lookup_sprite_by_name(name:string):Tile|undefined {
        if (this.sprite_lookup_by_name.has(name)) return this.sprite_lookup_by_name.get(name)
        for (const sheet of this.getPropValue('sheets') as Sheet[]) {
            for (const tile of sheet.getPropValue('tiles') as Tile[]) {
                if (tile.getPropValue('name') === name) {
                    // console.log("caching",id,tile.getPropValue('name'), tile.cache_canvas)
                    this.sprite_lookup.set(tile._id, tile)
                    this.sprite_lookup_by_name.set(tile.getPropValue('name'),tile)
                    return tile
                }
            }
        }
        console.log("missing", name)
        return undefined
    }

    lookup_canvas(id: string) {
        const tile = this.lookup_sprite(id)
        if(tile) {
            if(!this.image_cache.has(tile)) {
                const can = gen_canvas(tile,this.getPropValue('palette'))
                this.image_cache.set(tile,can)
            }
            return this.image_cache.get(tile)
        }
    }
    markDirty(id:string) {
        const tile = this.lookup_sprite(id)
        if(tile) {
            this.image_cache.delete(tile)
        }
    }
}
CLASS_REGISTRY.register('Doc',GameDoc,GameDocDefs)


