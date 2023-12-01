import { ArrayGrid, Bounds, Point, Size } from "josh_js_util"

import { appendToList, DefList, PropDefBuilder, PropsBase, PropValues } from "./base"
import {
  ArrayGridNumberDef,
  BooleanDef,
  FloatDef,
  GenericDataArrayDef,
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

interface ImagePixelLayerType extends ImageLayerType {
  data: ArrayGrid<number>
}

const ImagePixelLayerData = ArrayGridNumberDef.copy().withEditable(false).withHidden(true)
export const ImagePixelLayerDefs: DefList<ImagePixelLayerType> = {
  name: NameDef,
  visible: BooleanDef,
  opacity: FloatDef,
  data: ImagePixelLayerData,
}

interface ImageLayerAPI {
  crop(rect: Bounds): void
  resize(size: Size): void
  opacity(): number
  visible(): boolean
  setImage(image: SImage): void
}

export class ImagePixelLayer extends PropsBase<ImagePixelLayerType> implements ImageLayerAPI {
  private image: SImage
  constructor(opts?: PropValues<ImagePixelLayerType>) {
    super(ImagePixelLayerDefs, opts)
  }
  setImage(image: SImage) {
    this.image = image
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
    const old = this.getPropValue("data").get(pt)
    this.getPropValue("data").set(pt, color)
    this._fire("data", this.getPropValue("data"))
    this._fireAll()
    if (this.image) this.image.appendHistory(new LayerPixelChange(this, pt, old, color))
  }
  copyPixelsFrom(src: ArrayGrid<number>, filter?: (v: number) => boolean) {
    const curr = this.getPropValue("data")
    const prev = new ArrayGrid<number>(curr.w, curr.h)
    prev.fill((n) => curr.get(n))
    curr.forEach((v, n) => {
      const vv = src.get(n)
      if (filter && filter(vv)) {
        curr.set(n, vv)
      }
    })
    if (this.image) this.image.appendHistory(new LayerGridChange(this, prev, curr))
  }
  setPixelRaw(pt: Point, color: number) {
    this.getPropValue("data").set(pt, color)
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

  opacity(): number {
    return this.getPropValue("opacity")
  }
  visible(): boolean {
    return this.getPropValue("visible")
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

export class ImageObjectLayer extends PropsBase<ImageObjectLayerType> implements ImageLayerAPI {
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
}
const SImageLayerArrayDef = GenericDataArrayDef.copy()
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
  }).withSkipPersisting(true),
}

interface HistoryEvent {
  undo(): void
  redo(): void
}

class LayerGridChange implements HistoryEvent {
  private layer: ImagePixelLayer
  private prev: ArrayGrid<number>
  private curr: ArrayGrid<number>
  constructor(layer: ImagePixelLayer, prev: ArrayGrid<number>, curr: ArrayGrid<number>) {
    this.layer = layer
    this.prev = prev
    this.curr = curr
  }
  undo() {
    this.layer.setPropValue("data", this.prev)
  }
  redo() {
    this.layer.setPropValue("data", this.curr)
  }
}

class LayerPixelChange implements HistoryEvent {
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
    this.history.push(evt)
    this.current_history_index += 1
    this.setPropValue("history", this.getPropValue("history") + 1)
  }
}
