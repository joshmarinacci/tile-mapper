import { ArrayGrid, Bounds, Point, Size } from "josh_js_util"

import { drawImage } from "../imageeditor/drawing"
import { ArrayGridToJson, cloneArrayGrid, JSONToArrayGrid } from "../util"
import {
  appendToList,
  ClassRegistry,
  DefList,
  JsonOut,
  PropDefBuilder,
  PropsBase,
  PropValues,
} from "./base"
import {
  ArrayGridNumberJSON,
  BooleanDef,
  FloatDef,
  NameDef,
  NumberDef,
  ObjectListDef,
  SizeDef,
  StringDef,
} from "./datamodel"
import { GameDoc } from "./gamedoc"

export interface ImageLayerType {
  name: string
  visible: boolean
  opacity: number
}

export const ImageLayerDefs: DefList<ImageLayerType> = {
  name: NameDef,
  visible: BooleanDef.copy().withDefault(() => true),
  opacity: FloatDef.copy().withDefault(() => 1.0),
}

export class ImageLayer extends PropsBase<ImageLayerType> {
  constructor(opts?: PropValues<ImageLayerType>) {
    super(ImageLayerDefs, opts)
  }
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

  // getFrame(frameNumber: number) {
  //   // console.log('get frame',this.frames.length,'vs',frameNumber)
  //   if (this.frames.length <= frameNumber) {
  //     // console.log("appending")
  //     const grid = ArrayGrid.fromSize<number>(this.image.getPropValue("size"))
  //     grid.fill(() => -1)
  //     this.frames.push(grid)
  //     // console.log("now frames",this.frames)
  //   }
  //   return this.frames[frameNumber]
  // }
  //
  // setFrameFromData(data: ArrayGrid<number>) {
  //   this.frames.push(data)
  // }

  // cloneAndAddFrame(currentFrame: number) {
  //   const orig = this.getFrame(currentFrame)
  //   const copy = new ArrayGrid<number>(orig.w, orig.h)
  //   copy.fill((n) => orig.get(n))
  //   this.frames.push(copy)
  // }
  // resize(size: Size) {
  //   const new_frames = this.frames.map((frame) => {
  //     const grid = ArrayGrid.fromSize<number>(size)
  //     grid.fill(() => -1)
  //     return grid
  //   })
  //   this.frames = new_frames
  // }
  clone() {
    return new ImageLayer({
      visible: this.getPropValue("visible"),
      opacity: this.getPropValue("opacity"),
      name: this.getPropValue("name"),
    })
  }
}

export interface ImageFrameType {
  name: string
  group: string
  duration: number
}

export const ImageFrameDefs: DefList<ImageFrameType> = {
  name: NameDef,
  duration: NumberDef.copy(),
  group: StringDef.copy().withDefault(() => "none"),
}

export class ImageFrame extends PropsBase<ImageFrameType> {
  constructor(opts?: PropValues<ImageFrameType>) {
    super(ImageFrameDefs, opts)
  }

  clone() {
    return new ImageFrame({
      name: this.getPropValue("name"),
      group: this.getPropValue("group"),
      duration: this.getPropValue("duration"),
    })
  }
}

export type SImageType = {
  name: string
  layers: ImageLayer[]
  frames: ImageFrame[]
  size: Size
  history: number
}

export const SImageDefs: DefList<SImageType> = {
  name: NameDef,
  layers: ObjectListDef.copy()
    .withEditable(false)
    .withHidden(true)
    .withWatchChildren(true)
    .withExpandable(true),
  frames: ObjectListDef.copy()
    .withEditable(false)
    .withHidden(true)
    .withWatchChildren(true)
    .withExpandable(true),
  size: SizeDef,
  history: new PropDefBuilder<number>({
    type: "integer",
    default: () => 0,
    format: (v) => v.toString(),
    fromJSON: (r, v) => 0,
    toJSON: (r, v) => v,
  })
    .withSkipPersisting(true)
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
  private layer: ImageLayer

  constructor(layer: ImageLayer, pt: Point, old: number, color: number) {
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

export type ImageBuffer = {
  data: ArrayGrid<number>
  layer: ImageLayer
  frame: ImageFrame
  key: string
}
export class SImage extends PropsBase<SImageType> {
  private history: HistoryEvent[]
  private current_history_index: number
  private buffers: Map<string, ImageBuffer>

  constructor(opts?: PropValues<SImageType>) {
    super(SImageDefs, opts)
    this.history = []
    this.current_history_index = -1
    this.buffers = new Map()
  }

  setPropValue<K extends keyof SImageType>(name: K, value: SImageType[K]) {
    if (name === "layers") {
      // const layers = value as unknown as ImageLayerAPI[]
      // layers.forEach((lay) => lay.setImage(this))
    }
    super.setPropValue(name, value)
  }
  appendLayer(layer: ImageLayer) {
    appendToList(this, "layers", layer)
  }
  appendFrame(frame: ImageFrame) {
    appendToList(this, "frames", frame)
  }
  getBuffer(layer: ImageLayer, frame: ImageFrame): ImageBuffer {
    if (!layer) throw new Error("cannot get buffer from an null layer")
    if (!frame) throw new Error("cannot get buffer from an null frame")
    const key = layer.getUUID() + "_" + frame.getUUID()
    if (!this.buffers.has(key)) {
      const size = this.size()
      const data = new ArrayGrid<number>(size.w, size.h)
      data.fill(() => -1)
      const buf: ImageBuffer = {
        key: key,
        layer: layer,
        frame: frame,
        data: data,
      }
      this.buffers.set(key, buf)
    }
    if (!this.buffers.has(key))
      throw new Error(`unknown buffer for layer ${layer.getUUID()} - frame ${frame.getUUID()}`)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return this.buffers.get(key)
  }
  layers() {
    return this.getPropValue("layers")
  }
  frames() {
    return this.getPropValue("frames")
  }

  crop(rect: Bounds) {
    this.getPropValue("layers").forEach((lay) => lay.crop(rect))
    this.setPropValue("size", rect.size())
  }

  resize(size: Size) {
    for (const key of this.buffers.keys()) {
      // console.log('resizing',key, this.buffers.get(key))
    }
    // this.getPropValue("layers").forEach((lay) => {
    //     lay.resize(size)
    // })
    this.setPropValue("size", size)
  }

  size() {
    return this.getPropValue("size")
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

  addEmptyFrame() {
    const frame = new ImageFrame()
    this.appendFrame(frame)
  }

  getPixelSurface(layer: ImageLayer, frame: ImageFrame) {
    if (!layer) throw new Error("cannot get buffer from an null layer")
    if (!frame) throw new Error("cannot get buffer from an null frame")
    return new LayerPixelSurface(this, layer, frame)
  }

  cloneAndAddFrame(oldFrame: ImageFrame) {
    const newFrame = new ImageFrame()
    this.appendFrame(newFrame)
    this.layers().forEach((layer) => {
      const oldSurf = this.getPixelSurface(layer, oldFrame)
      const newSurf = this.getPixelSurface(layer, newFrame)
      newSurf.setAllData(oldSurf.cloneData())
    })
  }

  getHistory() {
    return this.history
  }

  toJSON(reg: ClassRegistry) {
    const json = super.toJSON(reg)
    // console.log("saving out simage",this.getPropValue('name'))
    const buffers: Record<string, ArrayGridNumberJSON> = {}
    for (const key of this.buffers.keys()) {
      const buff = this.buffers.get(key) as ImageBuffer
      // console.log("exporting buffer",key,buff)
      if (!buff.layer) {
        console.log("cannot export buffer missing a layer")
        continue
      }
      if (!buff.frame) {
        console.log("cannot export buffer missing a frame")
        continue
      }
      buffers[key] = {
        key: key,
        layer: buff.layer.getUUID(),
        frame: buff.frame.getUUID(),
        data: ArrayGridToJson(buff.data),
      }
    }
    json.props.buffers = buffers
    return json
  }
  clone() {
    const new_image = new SImage({
      size: this.getPropValue("size"),
      name: this.getPropValue("name"),
    })
    const old_new_frames = new Map<string, ImageFrame>()
    const old_new_layers = new Map<string, ImageLayer>()
    for (const frame of this.frames()) {
      const new_frame: ImageFrame = frame.clone()
      old_new_frames.set(frame.getUUID(), new_frame)
      new_image.appendFrame(new_frame)
    }
    for (const layer of this.layers()) {
      const new_layer: ImageLayer = layer.clone()
      old_new_layers.set(layer.getUUID(), new_layer)
      new_image.appendLayer(new_layer)
    }
    for (const buff of this.buffers.values()) {
      console.log("adding buff", buff.key)
      const new_layer = old_new_layers.get(buff.layer.getUUID()) as ImageLayer
      const new_frame = old_new_frames.get(buff.frame.getUUID()) as ImageFrame
      const new_key = new_layer.getUUID() + "_" + new_frame.getUUID()
      console.log("new key", new_key)
      const new_buff: ImageBuffer = {
        data: cloneArrayGrid(buff.data),
        layer: old_new_layers.get(buff.layer.getUUID()) as ImageLayer,
        frame: old_new_frames.get(buff.frame.getUUID()) as ImageFrame,
        key: new_key,
      }
      console.log("cloning", new_buff.key, new_buff.data)
      new_image.buffers.set(new_buff.key, new_buff)
    }
    console.log("old image", this.getUUID())
    console.log("new image", new_image.getUUID())
    console.log(
      "old image layers",
      this.layers().map((f) => f.getUUID() + " " + f.getPropValue("name")),
    )

    console.log(
      "new image layers",
      new_image.layers().map((f) => f.getUUID() + " " + f.getPropValue("name")),
    )

    console.log(
      "old image frames",
      this.frames().map((f) => f.getUUID() + " " + f.getPropValue("name")),
    )
    console.log(
      "new image frames",
      new_image.frames().map((f) => f.getUUID() + " " + f.getPropValue("name")),
    )
    return new_image
  }

  fromJSON(reg: ClassRegistry, json: JsonOut<SImageType>) {
    if ("buffers" in json.props) {
      console.log("new style")
      for (const key of Object.keys(json.props.buffers)) {
        // console.log("restoring buffer", key)
        const json_obj = json.props.buffers[key]
        // console.log("json obj", json_obj)
        const buff: ImageBuffer = {
          key: key,
          layer: this.layers().find((layer) => layer.getUUID() === json_obj.layer),
          frame: this.frames().find((frame) => frame.getUUID() === json_obj.frame),
          data: JSONToArrayGrid(json_obj.data),
        }
        this.buffers.set(key, buff)
      }
    } else {
      console.log("old style canvas image")
      console.log("simage loading from json. do buffers", json.props)
      // console.log('this',this)
      for (const json_layer of json.props.layers) {
        const layer = this.layers().find((l) => l.getUUID() === json_layer.id)
        if (!layer) {
          throw new Error("Unable to restore malformed Layer")
        }
        if (json_layer.props.frames) {
          json_layer.props.frames.forEach((json_frame, i) => {
            const frame = new ImageFrame()
            this.appendFrame(frame)
            const data = JSONToArrayGrid(json_frame as ArrayGridNumberJSON)
            const surf = this.getPixelSurface(layer, this.frames()[i])
            surf.setAllData(data)
          })
        } else {
          this.appendFrame(new ImageFrame())
          const data = JSONToArrayGrid(json_layer.props.data)
          const surf = this.getPixelSurface(layer, this.frames()[0])
          surf.setAllData(data)
        }
      }
    }
  }

  toSimpleCanvas(doc: GameDoc): HTMLCanvasElement {
    const canvas = document.createElement("canvas")
    const size = this.getPropValue("size")
    canvas.width = size.w
    canvas.height = size.h
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D
    const frame = this.frames()[0]
    drawImage(doc, ctx, this, doc.palette(), 1, frame)
    return canvas
  }
}

type PixelFilter = (v: number, n: Point) => boolean
type PixelForEachCallback = (v: number, n: Point) => void

class LayerPixelSurface implements FramePixelSurface {
  private layer: ImageLayer
  private frame: ImageFrame
  private image: SImage

  constructor(image: SImage, lay: ImageLayer, frame: ImageFrame) {
    this.image = image
    this.layer = lay
    this.frame = frame
  }

  getPixel(p: Point): number {
    return this.buffer().get(p)
  }

  setPixel(p: Point, value: number): void {
    this.buffer().set(p, value)
  }

  fillAll(v: number): void {
    this.buffer().fill(() => v)
  }

  copyPixelsFrom(grid: ArrayGrid<number>, filter: PixelFilter) {
    const tgt = this.buffer()
    grid.forEach((v, n) => {
      if (filter(v, n)) tgt.set(n, v)
    })
  }

  forEach(cb: PixelForEachCallback) {
    this.buffer().forEach(cb)
  }

  isValidIndex(pt: Point): boolean {
    return this.buffer().isValidIndex(pt)
  }

  size(): Size {
    const buffer = this.buffer()
    return new Size(buffer.w, buffer.h)
  }
  cloneData(): ArrayGrid<number> {
    const frame = this.buffer()
    return cloneArrayGrid(frame)
  }
  setAllData(curr: ArrayGrid<number>) {
    const frame = this.buffer()
    frame.fill((n) => curr.get(n))
  }

  private buffer() {
    return this.image.getBuffer(this.layer, this.frame).data
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
