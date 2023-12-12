import { ArrayGrid, Bounds, Point, Size } from "josh_js_util"

import { cloneArrayGrid } from "../util"
import {
  appendToList,
  DefList,
  JsonOut,
  JSONValue,
  PropDefBuilder,
  PropsBase,
  PropValues,
} from "./base"
import {
  ArrayGridNumberDef,
  BooleanDef,
  FloatDef,
  GenericDataArrayDef,
  IntegerDef,
  NameDef,
  PointDef,
  SizeDef,
  StringDef,
} from "./datamodel"
import { PixelFontReferenceDef } from "./pixelfont"

export interface ImageObjectType {
  name: string
  position: Point
}

export interface TextObjectType extends ImageObjectType {
  text: string
  color: string
  font: string
}

export const TextObjectDefs: DefList<TextObjectType> = {
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

export interface ImageLayerType {
  name: string
  visible: boolean
  opacity: number
}

interface ImagePixelLayerType extends ImageLayerType {}

const ImagePixelLayerData = ArrayGridNumberDef.copy().withEditable(false).withHidden(true)
export const ImagePixelLayerDefs: DefList<ImagePixelLayerType> = {
  name: NameDef,
  visible: BooleanDef,
  opacity: FloatDef,
  // data: ImagePixelLayerData,
}

// interface ImageLayerAPI {
//   crop(rect: Bounds): void
//   resize(size: Size): void
//   opacity(): number
//   visible(): boolean
//   setImage(image: SImage): void
// }

export class ImagePixelLayer extends PropsBase<ImagePixelLayerType> {
  image: SImage
  private frames: ArrayGrid<number>[]

  constructor(opts?: PropValues<ImagePixelLayerType>) {
    super(ImagePixelLayerDefs, opts)
    this.frames = []
  }

  setImage(image: SImage) {
    this.image = image
  }

  toJSON(): JsonOut<Type> {
    const out = super.toJSON()
    console.log("layer output is", out)
    out.props["frames"] = this.frames.map((frame) => {
      return ArrayGridNumberDef.toJSON(frame)
    })
    return out
  }

  // resizeAndClear(size: Size) {
  //   const data = new ArrayGrid<number>(size.w, size.h)
  //   data.fill(() => -1)
  //   this.setPropValue("data", data)
  // }
  //
  // rebuildFromCanvas(canvas: SImage) {
  //   const size = canvas.getPropValue("size")
  //   const data = new ArrayGrid<number>(size.w, size.h)
  //   data.fill(() => -1)
  //   this.setPropValue("data", data)
  // }
  //
  // setPixel(pt: Point, color: number) {
  //   const old = this.getPropValue("data").get(pt)
  //   this.getPropValue("data").set(pt, color)
  //   this._fire("data", this.getPropValue("data"))
  //   this._fireAll()
  //   if (this.image) this.image.appendHistory(new LayerPixelChange(this, pt, old, color))
  // }
  // copyPixelsFrom(src: ArrayGrid<number>, filter?: (v: number) => boolean) {
  //   const curr = this.getPropValue("data")
  //   const prev = new ArrayGrid<number>(curr.w, curr.h)
  //   prev.fill((n) => curr.get(n))
  //   curr.forEach((v, n) => {
  //     const vv = src.get(n)
  //     if (filter && filter(vv)) {
  //       curr.set(n, vv)
  //     }
  //   })
  //   if (this.image) this.image.appendHistory(new LayerGridChange(this, prev, curr))
  // }
  // setPixelRaw(pt: Point, color: number) {
  //   this.getPropValue("data").set(pt, color)
  // }
  //
  // getPixel(pt: Point): number {
  //   return this.getPropValue("data").get(pt)
  // }
  //
  // fillAll(number: number) {
  //   this.getPropValue("data").fill(() => number)
  //   this._fire("data", this.getPropValue("data"))
  //   this._fireAll()
  // }
  //
  // crop(rect: Bounds) {
  //   const data = this.getPropValue("data")
  //   console.log("cropping", data.w, data.h, "to", rect)
  //   const newData = new ArrayGrid<number>(rect.w, rect.h)
  //   for (let i = rect.left(); i < rect.right(); i++) {
  //     for (let j = rect.top(); j < rect.bottom(); j++) {
  //       const v = data.get_at(i, j)
  //       newData.set_at(i - rect.left(), j - rect.top(), v)
  //     }
  //   }
  //   this.setPropValue("data", newData)
  // }
  //
  // resize(size: Size) {
  //   const data = this.getPropValue("data")
  //   const newData = ArrayGrid.fromSize<number>(size)
  //   newData.fill((n) => {
  //     if (data.isValidIndex(n)) return data.get(n)
  //     return -1
  //   })
  //   this.setPropValue("data", newData)
  // }

  opacity(): number {
    return this.getPropValue("opacity")
  }

  visible(): boolean {
    return this.getPropValue("visible")
  }

  getFrame(frameNumber: number) {
    // console.log('get frame',this.frames.length,'vs',frameNumber)
    if (this.frames.length <= frameNumber) {
      // console.log("appending")
      const grid = ArrayGrid.fromSize<number>(this.image.getPropValue("size"))
      grid.fill(() => -1)
      this.frames.push(grid)
      // console.log("now frames",this.frames)
    }
    return this.frames[frameNumber]
  }

  setFrameFromData(data: ArrayGrid<number>) {
    this.frames.push(data)
  }

  cloneAndAddFrame(currentFrame: number) {
    const orig = this.getFrame(currentFrame)
    const copy = new ArrayGrid<number>(orig.w, orig.h)
    copy.fill((n) => orig.get(n))
    this.frames.push(copy)
  }
}

interface ImageObjectLayerType extends ImageLayerType {
  data: TextObject[]
}

const ImageObjectLayerData = GenericDataArrayDef.copy().withWatchChildren(true)
export const ImageObjectLayerDefs: DefList<ImageObjectLayerType> = {
  name: NameDef,
  visible: BooleanDef,
  opacity: FloatDef,
  data: ImageObjectLayerData,
}

export class ImageObjectLayer extends PropsBase<ImageObjectLayerType> {
  private image: SImage

  constructor(opts?: PropValues<ImageObjectLayerType>) {
    super(ImageObjectLayerDefs, opts)
  }

  setImage(image: SImage) {
    this.image = image
  }

  crop(rect: Bounds): void {}

  resize(size: Size): void {}

  opacity(): number {
    return this.getPropValue("opacity")
  }

  visible(): boolean {
    return this.getPropValue("visible")
  }
}

type SImageType = {
  name: string
  layers: PropsBase<ImageLayerType>[]
  size: Size
  history: number
  frameCount: number
}
//   toJSON: (v) =>
//       v.map((a) => {
//         if ("toJSON" in a) return a.toJSON() as unknown as object
//         return a
//       }),
//   fromJSON: (v) => v.map((a) => restoreClassFromJSON(a)),
// })
//     .withEditable(false)
//     .withHidden(true)

const SImageLayerArrayDef = new PropDefBuilder<object[]>({
  type: "array",
  default: () => [],
  format: () => "unknown",
  fromJSON: (json: JSONValue[]) => {
    return json.map((json) => {
      console.log("loading layer info", json)
      if (json["class"] === "ImageLayer") {
        const layer = new ImagePixelLayer({
          name: json.props.name,
          opacity: json.props.opacity,
          visible: json.props.visible,
        })
        if (json.props["data"]) {
          const grid = ArrayGridNumberDef.fromJSON(json.props.data)
          layer.setFrameFromData(grid)
        }
        if (json.props["frames"]) {
          console.log("loading up frames", json.props["frames"])
          json.props.frames.forEach((frame) => {
            console.log("loading in a frame", frame)
            layer.setFrameFromData(ArrayGridNumberDef.fromJSON(frame))
          })
        }
        return layer
      }
      return new ImagePixelLayer()
    })
  },
  toJSON: (v) => {
    return v.map((a) => {
      if ("toJSON" in a) return a.toJSON() as unknown as object
      return a
    })
  },
})
  .withEditable(false)
  .withHidden(true)
  .withWatchChildren(true)
  .withExpandable(true)
export const SImageDefs: DefList<SImageType> = {
  name: NameDef,
  layers: SImageLayerArrayDef,
  size: SizeDef,
  history: new PropDefBuilder<number>({
    type: "integer",
    default: () => 0,
    format: (v) => v.toString(),
    fromJSON: (v) => 0,
    toJSON: (v) => v,
  })
    .withSkipPersisting(true)
    .withHidden(true),
  frameCount: IntegerDef.copy()
    .withDefault(() => 1)
    .withHidden(true),
}

export interface HistoryEvent {
  name(): string
  undo(): void
  redo(): void
}

export class AreaChange implements HistoryEvent {
  private prev: ArrayGrid<number>
  private curr: ArrayGrid<number>
  private surf: FramePixelSurface
  private _name: string

  constructor(
    surf: FramePixelSurface,
    prev: ArrayGrid<number>,
    curr: ArrayGrid<number>,
    name?: string,
  ) {
    this.surf = surf
    this.prev = prev
    this.curr = curr
    this._name = name ? name : "area change"
  }

  name(): string {
    return this._name
  }

  undo() {
    this.surf.setAllData(this.prev)
  }

  redo() {
    this.surf.setAllData(this.curr)
  }
}

class PixelChange implements HistoryEvent {
  private point: Point
  private prev: number
  private curr: number
  private layer: ImagePixelLayer

  constructor(layer: ImagePixelLayer, pt: Point, old: number, color: number) {
    this.layer = layer
    this.point = pt
    this.prev = old
    this.curr = color
  }

  undo() {
    this.layer.setPixelRaw(this.point, this.prev)
  }

  redo() {
    this.layer.setPixelRaw(this.point, this.curr)
  }
  name(): string {
    return "pixel change"
  }
}

export class SImage extends PropsBase<SImageType> {
  private history: HistoryEvent[]
  private current_history_index: number

  constructor(opts?: PropValues<SImageType>) {
    super(SImageDefs, opts)
    this.history = []
    this.current_history_index = -1
  }

  setPropValue<K extends keyof SImageType>(name: K, value: SImageType[K]) {
    if (name === "layers") {
      const layers = value as unknown as ImageLayerAPI[]
      layers.forEach((lay) => lay.setImage(this))
    }
    super.setPropValue(name, value)
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

  size() {
    return this.getPropValue("size")
  }

  layers() {
    return this.getPropValue("layers")
  }

  getHistoryLength() {
    return this.history.length
  }

  getHistoryPosition() {
    return this.current_history_index
  }

  undo() {
    // console.log("undoing. hist len", this.history.length, 'curr',this.current_history_index)
    if (this.current_history_index >= 0) {
      const event = this.history[this.current_history_index]
      this.current_history_index -= 1
      // console.log("undoing",event)
      event.undo()
      this.setPropValue("history", this.getPropValue("history") + 1)
    }
  }

  redo() {
    // console.log("redoing. hist len", this.history.length, 'curr',this.current_history_index)
    if (this.current_history_index < this.history.length - 1) {
      this.current_history_index += 1
      const event = this.history[this.current_history_index]
      event.redo()
      this.setPropValue("history", this.getPropValue("history") + 1)
    }
  }

  appendHistory(evt: HistoryEvent) {
    if (this.history.length > this.current_history_index + 1) {
      this.history = this.history.slice(0, this.current_history_index + 1)
    }
    this.history.push(evt)
    this.current_history_index += 1
    this.setPropValue("history", this.getPropValue("history") + 1)
  }

  getFramePixelSurfaces(frameNumber: number): FramePixelSurface[] {
    const layers = this.layers()
      .filter((lay) => lay instanceof ImagePixelLayer)
      .map((lay) => lay as ImagePixelLayer)
      .map((lay) => new LayerPixelSurface(lay, frameNumber))
    return layers
  }

  addEmptyFrame() {
    this.setPropValue("frameCount", this.getPropValue("frameCount") + 1)
  }

  getFramePixelSurface(layer: ImagePixelLayer, number: number): FramePixelSurface {
    return new LayerPixelSurface(layer, number)
  }

  cloneAndAddFrame(currentFrame: number) {
    this.layers().forEach((layer) => {
      if (layer instanceof ImagePixelLayer) {
        layer.cloneAndAddFrame(currentFrame)
      }
    })
    this.setPropValue("frameCount", this.getPropValue("frameCount") + 1)
  }

  getFramePixelSurfacesForLayer(layer: ImagePixelLayer): FramePixelSurface[] {
    const surfs = []
    for (let i = 0; i < this.getPropValue("frameCount"); i++) {
      surfs.push(this.getFramePixelSurface(layer, i))
    }
    return surfs
  }

  getAllFramePixelSurfaces(): FramePixelSurface[] {
    const surfs: FramePixelSurface[] = []
    this.layers().forEach((layer) => {
      if (layer instanceof ImagePixelLayer) {
        for (let i = 0; i < this.getPropValue("frameCount"); i++) {
          surfs.push(this.getFramePixelSurface(layer, i))
        }
      }
    })
    return surfs
  }

  getHistory() {
    return this.history
  }
}

type PixelFilter = (v: number, n: Point) => boolean
type PixelForEachCallback = (v: number, n: Point) => void

class LayerPixelSurface implements FramePixelSurface {
  private layer: ImagePixelLayer
  private frameNumber: number

  constructor(lay: ImagePixelLayer, frameNumber: number) {
    this.layer = lay
    this.frameNumber = frameNumber
  }

  getPixel(p: Point): number {
    return this.layer.getFrame(this.frameNumber).get(p)
  }

  setPixel(p: Point, value: number): void {
    this.layer.getFrame(this.frameNumber).set(p, value)
  }

  fillAll(v: number): void {
    this.layer.getFrame(this.frameNumber).fill(() => v)
  }

  copyPixelsFrom(grid: ArrayGrid<number>, filter: PixelFilter) {
    const tgt = this.layer.getFrame(this.frameNumber)
    grid.forEach((v, n) => {
      if (filter(v, n)) tgt.set(n, v)
    })
  }

  forEach(cb: PixelForEachCallback) {
    const tgt = this.layer.getFrame(this.frameNumber)
    tgt.forEach(cb)
  }

  isValidIndex(pt: Point): boolean {
    return this.layer.getFrame(this.frameNumber).isValidIndex(pt)
  }

  size(): Size {
    const frame = this.layer.getFrame(this.frameNumber)
    return new Size(frame.w, frame.h)
  }
  cloneData(): ArrayGrid<number> {
    const frame = this.layer.getFrame(this.frameNumber)
    return cloneArrayGrid(frame)
  }
  setAllData(curr: ArrayGrid<number>) {
    const frame = this.layer.getFrame(this.frameNumber)
    frame.fill((n) => curr.get(n))
  }
}

export class ArrayGridPixelSurface implements FramePixelSurface {
  data: ArrayGrid<number>

  constructor(data: ArrayGrid<number>) {
    this.data = data
  }

  getPixel(p: Point): number {
    return this.data.get(p)
  }

  setPixel(p: Point, value: number): void {
    this.data.set(p, value)
  }

  fillAll(v: number): void {
    this.data.fill(() => v)
  }

  copyPixelsFrom(grid: ArrayGrid<number>, filter: PixelFilter) {
    this.data.forEach((v, n) => {
      if (filter(v, n)) tgt.set(n, v)
    })
  }

  forEach(cb: PixelForEachCallback) {
    this.data.forEach(cb)
  }

  isValidIndex(pt: Point): boolean {
    return this.data.isValidIndex(pt)
  }

  size(): Size {
    return new Size(this.data.w, this.data.h)
  }
  cloneData(): ArrayGrid<number> {
    return cloneArrayGrid(this.data)
  }
  setAllData(curr: ArrayGrid<number>) {
    this.data.fill((n) => curr.get(n))
  }
}

export interface FramePixelSurface {
  setPixel(p: Point, n: number): void

  getPixel(p: Point): number

  fillAll(color: number): void

  copyPixelsFrom(grid: ArrayGrid<number>, filter: PixelFilter): void

  forEach(cb: PixelForEachCallback): void

  isValidIndex(pt: Point): boolean

  size(): Size

  cloneData(): ArrayGrid<number>

  setAllData(curr: ArrayGrid<number>): void
}
