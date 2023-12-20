import { ArrayGrid, Bounds, Point, Size } from "josh_js_util"

import { ImagePalette, PICO8, RESURRECT64 } from "../common/common"
import {
  DefList,
  PropDef,
  PropDefBuilder,
  PropsBase,
  PropValues,
  restoreClassFromJSON,
} from "./base"

export const BooleanDef: PropDefBuilder<boolean> = new PropDefBuilder<boolean>({
  type: "boolean",
  default: () => false,
  format: (v) => (v ? "true" : "false"),
  toJSON: (r, v) => v,
  fromJSON: (v) => v as boolean,
})
export const StringDef = new PropDefBuilder<string>({
  type: "string",
  default: () => "empty",
  format: (v) => v,
  toJSON: (r, v: string) => v,
  fromJSON: (v) => v as string,
})
export const NumberDef = new PropDefBuilder<number>({
  type: "float",
  default: () => 0.0,
  format: (v) => v.toFixed(2),
  toJSON: (r, v) => v,
  fromJSON: (v) => v as number,
})
export const FloatDef = NumberDef.copy().withFormat((v) => v.toFixed(2))
export const IntegerDef = new PropDefBuilder<number>({
  type: "integer",
  default: () => 0,
  format: (v) => v.toFixed(0),
  toJSON: (r, v) => v,
  fromJSON: (v) => v as number,
})
export const SizeDef = new PropDefBuilder<Size>({
  type: "Size",
  default: () => new Size(10, 10),
  toJSON: (r, v) => v.toJSON(),
  fromJSON: (v) =>
    Size.fromJSON(
      v as {
        w: number
        h: number
      },
    ),
  format: (v) => `${v.w} x ${v.h}`,
})
export const PointDef = new PropDefBuilder<Point>({
  type: "Point",
  default: () => new Point(0, 0),
  format: (v) => `${v.x} , ${v.y}`,
  toJSON: (r, v) => v.toJSON(),
  fromJSON: (v) =>
    Point.fromJSON(
      v as {
        x: number
        y: number
      },
    ),
})
export const BoundsDef = new PropDefBuilder<Bounds>({
  type: "Bounds",
  default: () => new Bounds(0, 0, 16, 16),
  format: (v) => `${v.x}, ${v.y} -> ${v.w} x ${v.h}`,
  toJSON: (r, v) => v.toJSON(),
  fromJSON: (v) =>
    Bounds.fromJSON(
      v as {
        x: number
        y: number
        w: number
        h: number
      },
    ),
})
export const ArrayGridNumberDef = new PropDefBuilder<ArrayGrid<number>>({
  type: "array",
  default: () => new ArrayGrid<number>(1, 1),
  format: () => "array number data",
  toJSON: (r, v): ArrayGridNumberJSON => ({ w: v.w, h: v.h, data: v.data }),
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
  format: (v) => v.name,
  toJSON: (r, v) => v,
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
export const GenericDataArrayDef = new PropDefBuilder<object[]>({
  type: "array",
  default: () => [],
  format: () => "unknown",
  toJSON: (r, v) =>
    v.map((a) => {
      if ("toJSON" in a) return a.toJSON() as unknown as object
      return a
    }),
  fromJSON: (r, v) => v.map((a) => restoreClassFromJSON(a)),
})
  .withEditable(false)
  .withHidden(true)

export type ArrayGridNumberJSON = {
  w: number
  h: number
  data: number[]
}

type TestType = {
  name: string
}
export const TestDefs: DefList<TestType> = {
  name: NameDef,
}
export class GameTest extends PropsBase<TestType> {
  constructor(opts?: PropValues<TestType>) {
    super(TestDefs, opts)
  }
}
export const ObjectListDef = new PropDefBuilder<object[]>({
  type: "array",
  default: () => [],
  format: (v) => "object list",
  toJSON: (r, v) => v.map((vv) => vv.toJSON(r)),
  fromJSON: (r, v) => v.map((vv) => restoreClassFromJSON(r, vv)),
})
