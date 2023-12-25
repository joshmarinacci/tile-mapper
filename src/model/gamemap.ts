import { ArrayGrid, Point, Size } from "josh_js_util"

import {
  DefList,
  FloatSettings,
  PropDef,
  PropDefBuilder,
  PropsBase,
  PropValues,
  restoreClassFromJSON,
} from "./base"
import {
  ArrayGridNumberJSON,
  BlockingDef,
  BooleanDef,
  FloatDef,
  GenericDataArrayDef,
  MapCell,
  NameDef,
  PointDef,
  SizeDef,
  StringDef,
} from "./datamodel"

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
export type ActorMapLayerType = {
  type: "actor-layer"
  actors: ActorInstance[]
  scrollSpeed: number
} & MapLayerType
type ArrayGridMapCellJSON = {
  w: number
  h: number
  data: MapCell[]
}
const TileDataGridDef = new PropDefBuilder<ArrayGrid<MapCell>>({
  type: "array",
  default: () => new ArrayGrid<MapCell>(1, 1),
  format: (v) => `${v.size()} cells`,
  toJSON: (r, v) =>
    ({
      w: v.w,
      h: v.h,
      data: v.data,
    }) as ArrayGridMapCellJSON,
  fromJSON: (r, value) => {
    const v = value as ArrayGridNumberJSON
    const arr = new ArrayGrid<MapCell>(v.w, v.h)
    arr.data = v.data
    return arr
  },
})
  .withEditable(false)
  .withHidden(true)
const scrollSettings: FloatSettings = {
  type: "float",
  stepSize: 0.1,
  min: -3,
  max: 3,
}
export const TileLayerDefs: DefList<TileMapLayerType> = {
  name: NameDef,
  type: StringDef.copy()
    .withDefault(() => "tile-layer")
    .withEditable(false),
  blocking: BlockingDef,
  visible: BlockingDef,
  size: SizeDef,
  data: TileDataGridDef,
  wrapping: BooleanDef,
  scrollSpeed: FloatDef.copy()
    .withDefault(() => 1.0)
    .withSettings(scrollSettings),
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

type ActorInstanceType = {
  name: string
  position: Point
  actor: string
}
export const ActorInstanceDefs: DefList<ActorInstanceType> = {
  name: NameDef,
  position: PointDef,
  actor: {
    type: "reference",
    default: () => "unknown",
    expandable: false,
    hidden: false,
    editable: false,
    format: (v: string) => v,
    toJSON: (r, v) => v,
    fromJSON: (r, v) => v,
  },
}

export class ActorInstance extends PropsBase<ActorInstanceType> {
  constructor(opts?: PropValues<ActorInstanceType>) {
    super(ActorInstanceDefs, opts)
  }
}

export const ActorLayerDefs: DefList<ActorMapLayerType> = {
  name: NameDef,
  type: StringDef.copy()
    .withDefault(() => "actor-layer")
    .withEditable(false),
  blocking: BlockingDef,
  visible: BlockingDef,
  actors: GenericDataArrayDef,
  scrollSpeed: FloatDef.copy()
    .withDefault(() => 1.0)
    .withSettings(scrollSettings),
}

export class ActorLayer extends PropsBase<ActorMapLayerType> {
  constructor(opts?: PropValues<ActorMapLayerType>) {
    super(ActorLayerDefs, opts)
  }
}

export type ColorMapLayerType = {
  type: "color-layer"
  size: Size
  wrapping: boolean
  scrollSpeed: number
  color: string
} & MapLayerType

export const ColorMapLayerDefs: DefList<ColorMapLayerType> = {
  name: NameDef,
  type: StringDef.copy()
    .withDefault(() => "color-layer")
    .withEditable(false),
  blocking: BlockingDef,
  visible: BlockingDef,
  size: SizeDef,
  wrapping: BooleanDef,
  scrollSpeed: FloatDef.copy().withSettings(scrollSettings),
  color: StringDef.copy().withCustom("palette-color"),
}
export class ColorMapLayer extends PropsBase<ColorMapLayerType> {
  constructor(opts?: PropValues<ColorMapLayerType>) {
    super(ColorMapLayerDefs, opts)
  }
}

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
  toJSON: (r, v) =>
    v.map((a) => {
      if ("toJSON" in a) return a.toJSON(r)
      return a
    }),
  fromJSON: (r, v) => v.map((a) => restoreClassFromJSON(r, a)),
}
export const GameMapDefs: DefList<GameMapType> = {
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
