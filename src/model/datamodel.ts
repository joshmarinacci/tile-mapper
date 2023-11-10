import { ArrayGrid, Bounds, Point, Size } from "josh_js_util"

import { ImagePalette, PICO8, RESURRECT64 } from "../common/common"
import {
  appendToList,
  CLASS_REGISTRY,
  DefList,
  PropDef,
  PropDefBuilder,
  PropsBase,
  PropValues,
  restoreClassFromJSON,
} from "./base"

export const BooleanDef: PropDefBuilder<boolean> = new PropDefBuilder<boolean>({
  type: "boolean",
  toJSON: (v) => v,
  fromJSON: (v) => v as boolean,
  format: (v) => (v ? "true" : "false"),
  default: () => false,
})
export const StringDef = new PropDefBuilder<string>({
  type: "string",
  fromJSON: (v) => v as string,
  default: () => "empty",
  toJSON: (v: string) => v,
  format: (v) => v,
})
export const NumberDef = new PropDefBuilder<number>({
  type: "float",
  default: () => 0.0,
  format: (v) => v.toFixed(2),
  toJSON: (v) => v,
  fromJSON: (v) => v as number,
})
export const FloatDef = NumberDef.copy().withFormat((v) => v.toFixed(2))
export const IntegerDef = new PropDefBuilder<number>({
  type: "integer",
  default: () => 0,
  format: (v) => v.toFixed(0),
  toJSON: (v) => v,
  fromJSON: (v) => v as number,
})
export const SizeDef = new PropDefBuilder<Size>({
  type: "Size",
  default: () => new Size(10, 10),
  toJSON: (v) => v.toJSON(),
  fromJSON: (v) =>
    Size.fromJSON(
      v as {
        w: number
        h: number
      },
    ),
  format: (v) => `${v.w} x ${v.h}`,
})
const PointDef = new PropDefBuilder<Point>({
  type: "Point",
  default: () => new Point(0, 0),
  toJSON: (v) => v.toJSON(),
  fromJSON: (v) =>
    Point.fromJSON(
      v as {
        x: number
        y: number
      },
    ),
  format: (v) => `${v.x} , ${v.y}`,
})
export const BoundsDef = new PropDefBuilder<Bounds>({
  type: "Bounds",
  default: () => new Bounds(0, 0, 16, 16),
  toJSON: (v) => v.toJSON(),
  fromJSON: (v) =>
    Bounds.fromJSON(
      v as {
        x: number
        y: number
        w: number
        h: number
      },
    ),
  format: (v) => `${v.x}, ${v.y} -> ${v.w} x ${v.h}`,
})
const ArrayGridNumberDef = new PropDefBuilder<ArrayGrid<number>>({
  type: "array",
  default: () => new ArrayGrid<number>(1, 1),
  format: () => "array number data",
  toJSON: (v): ArrayGridNumberJSON => ({ w: v.w, h: v.h, data: v.data }),
  fromJSON: (value) => {
    const v = value as ArrayGridNumberJSON
    const arr = new ArrayGrid<number>(v.w, v.h)
    arr.data = v.data
    return arr
  },
})

export const NameDef: PropDef<string> = StringDef.copy().withDefault(() => "unnamed")

export const PaletteDef = new PropDefBuilder<ImagePalette>({
  type: "object",
  default: () => PICO8,
  toJSON: (v) => v,
  format: (v) => v.name,
  fromJSON: (v) => {
    if ("name" in v) {
      return v as ImagePalette
    } else {
      if ("length" in v) {
        if (v.length === 64) return RESURRECT64
        if (v.length === 17) return PICO8
      }
      return {
        name: "unknow",
        colors: v as string[],
      } as ImagePalette
    }
  },
}).withEditable(false)

export type MapCell = {
  tile: string //id of the sprite used to draw this
}

export const BlockingDef = BooleanDef.copy()

const GenericDataArrayDef = new PropDefBuilder<object[]>({
  type: "array",
  default: () => [],
  format: () => "unknown",
  toJSON: (v) =>
    v.map((a) => {
      if ("toJSON" in a) return a.toJSON() as unknown as object
      return a
    }),
  fromJSON: (v) => v.map((a) => restoreClassFromJSON(a)),
})
  .withEditable(false)
  .withHidden(true)

type ArrayGridNumberJSON = {
  w: number
  h: number
  data: number[]
}
type TileType = {
  name: string
  blocking: boolean
  data: ArrayGrid<number>
  size: Size
  gridPosition: Point
}
const TileDataDef = ArrayGridNumberDef.copy()
  .withEditable(false)
  .withHidden(true)
  .withWatchChildren(true)

const GridPointDef = PointDef.copy().withDefault(() => new Point(-1, -1))

const TileDefs: DefList<TileType> = {
  name: NameDef,
  blocking: BlockingDef,
  data: TileDataDef,
  size: SizeDef,
  gridPosition: GridPointDef,
}

export class Tile extends PropsBase<TileType> {
  constructor(opts?: PropValues<TileType>) {
    super(TileDefs, opts)
    const size = this.getPropValue("size")
    const data = this.getPropValue("data")
    if (data.w !== size.w || data.h !== size.h) {
      // this.log("we must rebuild the data with a new size")
      const data = new ArrayGrid<number>(size.w, size.h)
      data.fill(() => 0)
      this.setPropValue("data", data)
    }
  }

  setPixel(number: number, point: Point) {
    this.getPropValue("data").set(point, number)
    this._fire("data", this.getPropValue("data"))
    this._fireAll()
  }

  width() {
    return this.getPropValue("size").w
  }

  height() {
    return this.getPropValue("size").h
  }

  getPixel(point: Point) {
    return this.getPropValue("data").get(point)
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
      size: this.getPropValue("size"),
      blocking: this.getPropValue("blocking"),
      name: this.getPropValue("name"),
      gridPosition: this.getPropValue("gridPosition"),
    })
    new_tile.getPropValue("data").data = this.data().data.slice()
    return new_tile
  }

  private log(...args: unknown[]) {
    console.log(this.constructor.name, ...args)
  }

  private data() {
    return this.getPropValue("data")
  }
}

CLASS_REGISTRY.register("Tile", Tile, TileDefs)

export interface ImageObjectType {
  name: string
  position: Point
}
export interface TextObjectType extends ImageObjectType {
  text: string
  color: string
  font: string
}
const PixelFontReferenceDef = new PropDefBuilder<string>({
  type: "reference",
  format: (v) => "font",
  default: () => "unknown",
  toJSON: (v) => v,
  fromJSON: (v) => v.toString(),
}).withCustom("font-reference")

const TextObjectDefs: DefList<TextObjectType> = {
  name: NameDef,
  position: PointDef.copy().withEditable(true),
  text: StringDef.copy().withDefault(() => "Greetings Earthling"),
  color: StringDef.copy()
    .withDefault(() => "black")
    .withCustom("palette-color"),
  font: PixelFontReferenceDef,
}
export class TextObject extends PropsBase<TextObjectType> {
  constructor(opts?: PropValues<TextObjectType>) {
    super(TextObjectDefs, opts)
  }

  contains(pt: Point) {
    return this.getPropValue("position").distance(pt) < 10
  }
}
CLASS_REGISTRY.register("TextObject", TextObject, TextObjectDefs)

export interface ImageLayerType {
  name: string
  visible: boolean
  opacity: number
}

interface ImagePixelLayerType extends ImageLayerType {
  data: ArrayGrid<number>
}
const ImagePixelLayerData = ArrayGridNumberDef.copy().withEditable(false).withHidden(true)
const ImagePixelLayerDefs: DefList<ImagePixelLayerType> = {
  name: NameDef,
  visible: BooleanDef,
  opacity: FloatDef,
  data: ImagePixelLayerData,
}
interface ImageLayerAPI {
  crop(rect: Bounds): void
  resize(size: Size): void
}
export class ImagePixelLayer extends PropsBase<ImagePixelLayerType> implements ImageLayerAPI {
  constructor(opts?: PropValues<ImagePixelLayerType>) {
    super(ImagePixelLayerDefs, opts)
  }

  resizeAndClear(size: Size) {
    const data = new ArrayGrid<number>(size.w, size.h)
    data.fill(() => -1)
    this.setPropValue("data", data)
  }
  rebuildFromCanvas(canvas: SImage) {
    const size = canvas.getPropValue("size")
    const data = new ArrayGrid<number>(size.w, size.h)
    data.fill(() => -1)
    this.setPropValue("data", data)
  }

  setPixel(pt: Point, color: number) {
    this.getPropValue("data").set(pt, color)
    this._fire("data", this.getPropValue("data"))
    this._fireAll()
  }

  getPixel(pt: Point): number {
    return this.getPropValue("data").get(pt)
  }

  fillAll(number: number) {
    this.getPropValue("data").fill(() => number)
    this._fire("data", this.getPropValue("data"))
    this._fireAll()
  }

  crop(rect: Bounds) {
    const data = this.getPropValue("data")
    console.log("cropping", data.w, data.h, "to", rect)
    const newData = new ArrayGrid<number>(rect.w, rect.h)
    for (let i = rect.left(); i < rect.right(); i++) {
      for (let j = rect.top(); j < rect.bottom(); j++) {
        const v = data.get_at(i, j)
        newData.set_at(i - rect.left(), j - rect.top(), v)
      }
    }
    this.setPropValue("data", newData)
  }
  resize(size: Size) {
    const data = this.getPropValue("data")
    const newData = ArrayGrid.fromSize<number>(size)
    newData.fill((n) => {
      if (data.isValidIndex(n)) return data.get(n)
      return -1
    })
    this.setPropValue("data", newData)
  }
}
CLASS_REGISTRY.register("ImageLayer", ImagePixelLayer, ImagePixelLayerDefs)

interface ImageObjectLayerType extends ImageLayerType {
  data: TextObject[]
}

const ImageObjectLayerData = GenericDataArrayDef.copy().withWatchChildren(true)
const ImageObjectLayerDefs: DefList<ImageObjectLayerType> = {
  name: NameDef,
  visible: BooleanDef,
  opacity: FloatDef,
  data: ImageObjectLayerData,
}

export class ImageObjectLayer extends PropsBase<ImageObjectLayerType> implements ImageLayerAPI {
  constructor(opts?: PropValues<ImageObjectLayerType>) {
    super(ImageObjectLayerDefs, opts)
  }
  crop(rect: Bounds): void {}
  resize(size: Size): void {}
}

CLASS_REGISTRY.register("ImageObjectLayer", ImageObjectLayer, ImageObjectLayerDefs)

type SImageType = {
  name: string
  layers: PropsBase<ImageLayerType>[]
  size: Size
}

const SImageLayerArrayDef = GenericDataArrayDef.copy()
  .withEditable(false)
  .withHidden(true)
  .withWatchChildren(true)

const SImageDefs: DefList<SImageType> = {
  name: NameDef,
  layers: SImageLayerArrayDef,
  size: SizeDef,
}

export class SImage extends PropsBase<SImageType> {
  constructor(opts?: PropValues<SImageType>) {
    super(SImageDefs, opts)
  }

  crop(rect: Bounds) {
    this.getPropValue("layers").forEach((lay) => lay.crop(rect))
    this.setPropValue("size", rect.size())
  }

  appendLayer(layer: ImagePixelLayer | ImageObjectLayer) {
    appendToList(this, "layers", layer as unknown as PropsBase<ImageLayerType>)
  }

  resize(size: Size) {
    this.getPropValue("layers").forEach((lay) => lay.resize(size))
    this.setPropValue("size", size)
  }
}

CLASS_REGISTRY.register("SImage", SImage, SImageDefs)

type SheetType = {
  name: string
  tileSize: Size
  tiles: Tile[]
  selectedTile: Tile | undefined
  showNames: boolean
  showGrid: boolean
  locked: boolean
  viewMode: "list" | "grid"
}
const TileArrayDef: PropDef<Tile[]> = {
  type: "array",
  editable: false,
  hidden: true,
  expandable: false,
  watchChildren: true,
  default: () => [],
  toJSON: (v) => v.map((t) => t.toJSON()),
  format: (v) => "list of tiles",
  fromJSON: (value) => {
    const v = value as []
    return v.map((d) => restoreClassFromJSON(d)) as Tile[]
  },
}

export const TransientBooleanDef = BooleanDef.copy().withSkipPersisting(true).withHidden(true)
const SheetDefs: DefList<SheetType> = {
  name: NameDef,
  tileSize: SizeDef,
  tiles: TileArrayDef,
  selectedTile: {
    type: "object",
    hidden: true,
    default: () => undefined,
    expandable: false,
    editable: false,
    watchChildren: false,
    skipPersisting: true,
  },
  showNames: TransientBooleanDef,
  showGrid: TransientBooleanDef,
  locked: TransientBooleanDef,
  viewMode: StringDef.withDefault(() => "list"),
}

export class Sheet extends PropsBase<SheetType> {
  constructor(opts?: PropValues<SheetType>) {
    super(SheetDefs, opts)
  }

  addTile(new_tile: Tile) {
    appendToList(this, "tiles", new_tile)
  }

  removeTile(tile: Tile) {
    const tiles = this.getPropValue("tiles") as Tile[]
    const n = tiles.indexOf(tile)
    if (n >= 0) {
      tiles.splice(n, 1)
      this.setPropValue("tiles", tiles.slice())
    } else {
      console.warn("cannot delete sprite")
    }
  }

  addNewTile() {
    const size = this.getPropValue("tileSize")
    const tile = new Tile({ size: size, gridPosition: new Point(-1, -1) })
    this.addTile(tile)
    return tile
  }
}

CLASS_REGISTRY.register("Sheet", Sheet, SheetDefs)

export type MapLayerType = {
  name: string
  type: string
  blocking: boolean
  visible: boolean
}
type TileMapLayerType = {
  type: "tile-layer"
  size: Size
  data: ArrayGrid<MapCell>
  wrapping: boolean
  scrollSpeed: number
} & MapLayerType
type ActorMapLayerType = {
  type: "actor-layer"
  actors: ActorInstance[]
} & MapLayerType

type ArrayGridMapCellJSON = {
  w: number
  h: number
  data: MapCell[]
}
const TileDataGridDef = new PropDefBuilder<ArrayGrid<MapCell>>({
  type: "array",
  toJSON: (v) =>
    ({
      w: v.w,
      h: v.h,
      data: v.data,
    }) as ArrayGridMapCellJSON,
  format: (v) => `${v.size()} cells`,
  default: () => new ArrayGrid<MapCell>(1, 1),
  fromJSON: (value) => {
    const v = value as ArrayGridNumberJSON
    const arr = new ArrayGrid<MapCell>(v.w, v.h)
    arr.data = v.data
    return arr
  },
})
  .withEditable(false)
  .withHidden(true)

const TileLayerDefs: DefList<TileMapLayerType> = {
  name: NameDef,
  type: StringDef.copy()
    .withDefault(() => "tile-layer")
    .withEditable(false),
  blocking: BlockingDef,
  visible: BlockingDef,
  size: SizeDef,
  data: TileDataGridDef,
  wrapping: BooleanDef,
  scrollSpeed: FloatDef,
}

export class TileLayer extends PropsBase<TileMapLayerType> {
  constructor(opts?: PropValues<TileMapLayerType>) {
    super(TileLayerDefs, opts)
    const size = this.getPropValue("size")
    const data = this.getPropValue("data")
    if (data.w !== size.w || data.h !== size.h) {
      // this.log("we must rebuild the data with a new size")
      const data = new ArrayGrid<MapCell>(size.w, size.h)
      data.fill(() => ({ tile: "unknown" }))
      this.setPropValue("data", data)
    }
  }
}

CLASS_REGISTRY.register("TileLayer", TileLayer, TileLayerDefs)

const ActorLayerDefs: DefList<ActorMapLayerType> = {
  name: NameDef,
  type: StringDef.copy()
    .withDefault(() => "actor-layer")
    .withEditable(false),
  blocking: BlockingDef,
  visible: BlockingDef,
  actors: GenericDataArrayDef,
}

export class ActorLayer extends PropsBase<ActorMapLayerType> {
  constructor(opts?: PropValues<ActorMapLayerType>) {
    super(ActorLayerDefs, opts)
  }
}

CLASS_REGISTRY.register("ActorLayer", ActorLayer, ActorLayerDefs)

type GameMapType = {
  name: string
  layers: PropsBase<any>[]
}
const LayerListDef: PropDef<PropsBase<any>[]> = {
  type: "array",
  editable: false,
  expandable: true,
  default: () => [],
  hidden: true,
  format: (v) => "layers",
  watchChildren: true,
  toJSON: (v) =>
    v.map((a) => {
      if ("toJSON" in a) return a.toJSON()
      return a
    }),
  fromJSON: (v) => v.map((a) => restoreClassFromJSON(a)),
}
const GameMapDefs: DefList<GameMapType> = {
  name: NameDef,
  layers: LayerListDef,
}

export class GameMap extends PropsBase<GameMapType> {
  constructor(opts?: PropValues<GameMapType>) {
    super(GameMapDefs, opts)
  }

  calcBiggestLayer() {
    const biggest = new Size(0, 0)
    this.getPropValue("layers").forEach((layer) => {
      if (layer instanceof TileLayer) {
        const size = layer.getPropValue("size")
        if (size.w > biggest.w) biggest.w = size.w
        if (size.h > biggest.h) biggest.h = size.h
      }
    })
    return biggest
  }
}

CLASS_REGISTRY.register("Map", GameMap, GameMapDefs)

export type ActorKind = "player" | "enemy" | "item" | "other"
export type ActorType = {
  name: string
  hitbox: Bounds
  viewbox: Bounds
  sprite: string | undefined
  kind: ActorKind
}
const ActorDefs: DefList<ActorType> = {
  name: NameDef,
  hitbox: BoundsDef,
  viewbox: BoundsDef,
  sprite: {
    type: "reference",
    custom: "image-reference",
    editable: true,
    hidden: false,
    expandable: false,
    default: () => undefined,
    format: (v) => (v ? `uuid ${v}` : "unknown"),
    toJSON: (v: string) => v,
    fromJson: (v: string) => v,
  },
  kind: StringDef.copy()
    .withDefault(() => "item")
    .withCustom("actor-type"),
}

export class Actor extends PropsBase<ActorType> {
  constructor(opts?: PropValues<ActorType>) {
    super(ActorDefs, opts)
  }
}

CLASS_REGISTRY.register("Actor", Actor, ActorDefs)

type ActorInstanceType = {
  name: string
  position: Point
  actor: string
}
const ActorInstanceDefs: DefList<ActorInstanceType> = {
  name: NameDef,
  position: PointDef,
  actor: {
    type: "reference",
    default: () => "unknown",
    expandable: false,
    hidden: false,
    editable: false,
    format: (v: string) => v,
    toJSON: (v) => v,
    fromJSON: (v) => v,
  },
}

export class ActorInstance extends PropsBase<ActorInstanceType> {
  constructor(opts?: PropValues<ActorInstanceType>) {
    super(ActorInstanceDefs, opts)
  }
}

CLASS_REGISTRY.register("ActorInstance", ActorInstance, ActorInstanceDefs)

const ViewportDef = SizeDef.copy()
type TestType = {
  name: string
  map: string | undefined
  viewport: Size
  gravity: number
  jump_power: number
  move_speed: number
  move_speed_max: number
  friction: number
}
const TestDefs: DefList<TestType> = {
  name: NameDef,
  map: {
    type: "reference",
    custom: "map-reference",
    editable: true,
    hidden: false,
    expandable: false,
    default: () => undefined,
    watchChildren: false,
    skipPersisting: false,
    format: (v) => `uuid ${v}`,
    toJSON: (v) => v,
    fromJSON: (v) => v,
  },
  viewport: ViewportDef,
}

export class GameTest extends PropsBase<TestType> {
  constructor(opts?: PropValues<TestType>) {
    super(TestDefs, opts)
  }
}

CLASS_REGISTRY.register("GameTest", GameTest, TestDefs)

export const ObjectListDef = new PropDefBuilder<object>({
  type: "array",
  default: () => [],
  toJSON: (v) => v.map((vv) => vv.toJSON()),
  format: (v) => "object list",
  fromJSON: (v) => v.map((vv) => restoreClassFromJSON(vv)),
})

type PixelGlyphType = {
  name: string
  codepoint: number
  size: Size
  baseline: number
  ascent: number
  descent: number
  left: number
  right: number
  data: ArrayGrid<number>
}

const PixelGlyphDefs: DefList<PixelGlyphType> = {
  name: NameDef,
  codepoint: IntegerDef.copy().withDefault(() => 65),
  size: SizeDef.copy().withDefault(() => new Size(16, 16)),
  baseline: IntegerDef.copy().withDefault(() => 12),
  ascent: IntegerDef.copy().withDefault(() => 10),
  descent: IntegerDef.copy().withDefault(() => 2),
  left: IntegerDef.copy().withDefault(() => 0),
  right: IntegerDef.copy().withDefault(() => 0),
  data: ArrayGridNumberDef.copy()
    .withWatchChildren(true)
    .withDefault(() => new ArrayGrid<number>(16, 16)),
}

export class PixelGlyph extends PropsBase<PixelGlyphType> {
  constructor(opts?: PropValues<PixelGlyphType>) {
    super(PixelGlyphDefs, opts)
  }
}

CLASS_REGISTRY.register("PixelGlyph", PixelGlyph, PixelGlyphDefs)

type PixelFontType = {
  name: string
  glyphs: PixelGlyph[]
}
const PixelGlyphListDef: PropDef<PixelGlyphType[]> = ObjectListDef.copy()
  .withHidden(true)
  .withWatchChildren(true)
const PixelFontDefs: DefList<PixelFontType> = {
  name: NameDef,
  glyphs: PixelGlyphListDef,
}

export class PixelFont extends PropsBase<PixelFontType> {
  constructor(opts?: PropValues<PixelFontType>) {
    super(PixelFontDefs, opts)
  }
}

CLASS_REGISTRY.register("PixelFont", PixelFont, PixelFontDefs)
