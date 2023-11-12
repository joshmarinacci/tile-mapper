import { ArrayGrid, Bounds, Point, Size } from "josh_js_util"

import { appendToList, DefList, PropsBase, PropValues } from "./base"
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
  constructor(opts?: PropValues<ImageObjectLayerType>) {
    super(ImageObjectLayerDefs, opts)
  }

  crop(rect: Bounds): void {}

  resize(size: Size): void {}
}

type SImageType = {
  name: string
  layers: PropsBase<ImageLayerType>[]
  size: Size
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
