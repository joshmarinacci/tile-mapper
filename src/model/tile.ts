import { ArrayGrid, Point, Size } from "josh_js_util"

import {
  ClassRegistry,
  DefList,
  JsonOut,
  PropDefBuilder,
  PropsBase,
  PropValues,
  restoreClassFromJSON,
} from "./base"
import { BlockingDef, NameDef, PointDef, SizeDef } from "./datamodel"
import { ImageFrame, ImageLayer, SImage } from "./image"

type TileType = {
  name: string
  blocking: boolean
  data: SImage
  size: Size
  gridPosition: Point
}

const TileDataDef: PropDefBuilder<SImage> = new PropDefBuilder({
  type: "object",
  default: () => {
    const image = new SImage()
    image.appendLayer(new ImageLayer({ visible: true, opacity: 1 }))
    image.appendFrame(new ImageFrame())
    return image
  },
  fromJSON: (json) => {
    // console.log("Loading json data into a tile",json)
    if (!json) throw new Error("cannot restore SImage from null json")
    if ("data" in json) {
      const size = new Size(json.w, json.h)
      const image = new SImage({ size })
      image.appendLayer(new ImageLayer({ visible: true, opacity: 1 }))
      image.appendFrame(new ImageFrame())
      const surf = image.getPixelSurface(image.layers()[0], image.frames()[0])
      const grid = ArrayGrid.fromArray<number>(size, json.data)
      surf.setAllData(grid)
      return image
    }
  },
  format: () => "not formattable",
  toJSON: (r, v) => {
    return v.toJSON(r)
  },
})

const GridPointDef = PointDef.copy()
  .withDefault(() => new Point(-1, -1))
  .withEditable(false)
  .withHidden(true)
export const TileDefs: DefList<TileType> = {
  name: NameDef,
  blocking: BlockingDef,
  data: TileDataDef,
  size: SizeDef.copy().withEditable(false).withHidden(true),
  gridPosition: GridPointDef,
}

export class Tile extends PropsBase<TileType> {
  constructor(opts?: PropValues<TileType>) {
    super(TileDefs, opts)
    if (this.getPropValue("data")) {
      this.getPropValue("data").resize(this.getPropValue("size"))
    }
  }

  setPixel(number: number, point: Point) {
    const image = this.getPropValue("data")
    const surf = image.getPixelSurface(image.layers()[0], image.frames()[0])
    surf.setPixel(point, number)
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
    const image = this.getPropValue("data")
    const surf = image.getPixelSurface(image.layers()[0], image.frames()[0])
    return surf.getPixel(point)
  }
  //
  // isValidIndex(pt: Point) {
  //   if (pt.x < 0) return false
  //   if (pt.y < 0) return false
  //   if (pt.x >= this.data().w) return false
  //   if (pt.y >= this.data().h) return false
  //   return true
  // }
  //
  // clone() {
  //   const new_tile = new Tile({
  //     size: this.getPropValue("size"),
  //     blocking: this.getPropValue("blocking"),
  //     name: this.getPropValue("name"),
  //     gridPosition: this.getPropValue("gridPosition"),
  //   })
  //   new_tile.getPropValue("data").data = this.data().data.slice()
  //   return new_tile
  // }

  private log(...args: unknown[]) {
    console.log(this.constructor.name, ...args)
  }

  fromJSON(reg: ClassRegistry, json: JsonOut<TileType>) {
    super.fromJSON(reg, json)
    console.log("tile loading", this.getPropValue("data"), json)
    const image = restoreClassFromJSON<SImage>(reg, json.props.data)
    // console.log("now image is",image)
    this.setPropValue("data", image)
  }

  // private data() {
  //   return this.getPropValue("data")
  // }
}
