import { ArrayGrid, Point, Size } from "josh_js_util"

import { DefList, PropsBase, PropValues } from "./base"
import { ArrayGridNumberDef, BlockingDef, NameDef, PointDef, SizeDef } from "./datamodel"

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
export const TileDefs: DefList<TileType> = {
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
