import { ArrayGrid, Point, Size } from "josh_js_util"
import { describe, expect, it } from "vitest"

import { floodFill } from "../imageeditor/fill_tool"
import { wrapPoint } from "../util"
import { JsonOut, JSONValue, restoreClassFromJSON } from "./base"
import { ArrayGridNumberJSON } from "./datamodel"
import {
  AreaChange,
  ArrayGridPixelSurface,
  FramePixelSurface,
  ImageFrame,
  ImageLayer,
  SImage,
} from "./image"
import { get_class_registry } from "./index"

describe("image with frames", () => {
  it("should create an image with one layer and three frames ", async () => {
    const img: SImage = new SImage({
      size: new Size(10, 10),
    })
    img.appendLayer(new ImageLayer())
    img.appendFrame(new ImageFrame())
    expect(img.layers().length).to.eq(1)
    // expect(img.pixelLayers().length).to.eq(1)

    {
      // set one pixel in the layer
      const layer = img.getPropValue("layers")[0]
      const frame = img.getPropValue("frames")[0]
      const surface: FramePixelSurface = img.getPixelSurface(layer, frame)
      surface.setPixel(new Point(0, 0), 8)
      expect(surface.getPixel(new Point(0, 0))).to.eq(8)
    }

    // add an empty frame so we have two frames
    expect(img.getPropValue("frames").length).to.eq(1)
    img.addEmptyFrame()
    expect(img.getPropValue("frames").length).to.eq(2)

    {
      // check pixel from first frame
      const layer = img.getPropValue("layers")[0]
      const frame0 = img.getPropValue("frames")[0]
      expect(img.getPixelSurface(layer, frame0).getPixel(new Point(0, 0))).toEqual(8)
      // check pixel from second frame
      const frame1 = img.getPropValue("frames")[1]
      console.log(img.getBuffer(layer, frame1))
      expect(img.getPixelSurface(layer, frame1).getPixel(new Point(0, 0))).toEqual(-1)
    }
  })
  it("should draw to a layer using pixel copy", () => {
    const img: SImage = new SImage({
      size: new Size(10, 10),
    })
    const origin = new Point(0, 0)
    const layer = new ImageLayer()
    img.appendLayer(layer)
    const frame = new ImageFrame()
    img.appendFrame(frame)
    const grid = new ArrayGrid<number>(3, 3)
    grid.fill(() => 5)
    expect(grid.get_at(0, 0)).toEqual(5)
    const surf = img.getPixelSurface(layer, frame)
    expect(surf.getPixel(origin)).toEqual(-1)
    surf.copyPixelsFrom(grid, () => true)
    expect(surf.getPixel(origin)).toEqual(5)
  })
  it("should wrap point", () => {
    const point = new Point(4, 4)
    const size = new Size(10, 10)
    expect(wrapPoint(point.add(new Point(1, 1)), size).x).toEqual(5)
    expect(wrapPoint(point.add(new Point(6, 1)), size).x).toEqual(0)
    expect(wrapPoint(point.add(new Point(8, 1)), size).x).toEqual(2)
    expect(wrapPoint(point.add(new Point(-1, 0)), size).x).toEqual(3)
    expect(wrapPoint(point.add(new Point(-4, 0)), size).x).toEqual(0)
    expect(wrapPoint(point.add(new Point(-6, 0)), size).x).toEqual(8)
  })
  it("should move a layer with wrapping", () => {
    // create image with one layer
    const size = new Size(12, 10)
    const image = new SImage({ size: size })
    image.appendLayer(new ImageLayer({ visible: true, opacity: 1.0 }))
    const layer = image.layers()[0]
    image.appendFrame(new ImageFrame())
    const frame = image.frames()[0]
    const surf = image.getPixelSurface(layer, frame)
    // fill image with 1
    surf.fillAll(1)
    // fill half image with 2
    surf.forEach((v, n) => {
      if (n.x >= 6) {
        surf.setPixel(n, 2)
      }
    })
    const LEFT = new Point(5, 0)
    const RIGHT = new Point(6, 0)
    expect(surf.getPixel(LEFT)).toEqual(1)
    expect(surf.getPixel(RIGHT)).toEqual(2)
    const pixels = new ArrayGrid<number>(size.w, size.h)
    pixels.forEach((v, n) => {
      pixels.set(n, surf.getPixel(n))
    })
    console.log(pixels)

    // move by one pixel left
    // surf.shiftBy(new Point(1,0))
    {
      const off = new Point(-1, 0)
      pixels.forEach((v, n) => {
        surf.setPixel(wrapPoint(n.add(off), size), v)
      })
      // check
      expect(surf.getPixel(LEFT)).toEqual(2)
    }
    {
      // move by two pixels right
      const off = new Point(2, 0)
      pixels.forEach((v, n) => {
        surf.setPixel(wrapPoint(n.add(off), size), v)
      })
      expect(surf.getPixel(LEFT)).toEqual(1)
      expect(surf.getPixel(RIGHT)).toEqual(1)
    }
  })
  it("should clone an image with two layers and three frames", async () => {
    const PT = new Point(3, 3)
    const COLOR = 5
    const img: SImage = new SImage({
      size: new Size(10, 10),
    })
    {
      img.appendLayer(new ImageLayer({ name: "layer 1", opacity: 0.5, visible: true }))
      img.appendLayer(new ImageLayer({ name: "layer 2", opacity: 1.0, visible: false }))
      img.appendFrame(new ImageFrame({ name: "frame 1", group: "foo", duration: 0.1 }))
      img.appendFrame(new ImageFrame({ name: "frame 2", group: "bar", duration: 0.2 }))
      // img.appendFrame(new ImageFrame({name: 'frame 3', group: "baz", duration: 1.0}))
      const surf = img.getPixelSurface(img.layers()[0], img.frames()[1])
      surf.setPixel(PT, COLOR)
      expect(img.layers().length).toEqual(2)
      // expect(img.frames().length).toEqual(3)
      const l1 = img.layers()[0]
      // const l2 = img.layers()[2]
      const f1 = img.frames()[0]
      const f2 = img.frames()[1]
      expect(l1.getPropValue("name")).toEqual("layer 1")
      expect(l1.getPropValue("opacity")).toEqual(0.5)
      expect(f2.getPropValue("name")).toEqual("frame 2")
      expect(img.getPixelSurface(l1, f1).getPixel(PT)).toEqual(-1)
      expect(img.getPixelSurface(l1, f2).getPixel(PT)).toEqual(COLOR)
      expect(img.getBuffer(l1, f1).key).toEqual(l1.getUUID() + "_" + f1.getUUID())
      expect(img.getBuffer(l1, f2).key).toEqual(l1.getUUID() + "_" + f2.getUUID())
    }

    {
      const img2 = img.clone()
      expect(img2.layers().length).toEqual(2)
      // expect(img2.frames().length).toEqual(3)
      const l1 = img2.layers()[0]
      // const l2 = img2.layers()[2]
      const f1 = img2.frames()[0]
      const f2 = img2.frames()[1]
      expect(l1.getPropValue("name")).toEqual("layer 1")
      expect(f2.getPropValue("name")).toEqual("frame 2")
      console.log("buf is", img2.getBuffer(l1, f1).key)
      console.log("buf is", img2.getBuffer(l1, f2).key)
      expect(img2.getPixelSurface(l1, f1).getPixel(PT)).toEqual(-1)
      expect(img2.getPixelSurface(l1, f2).getPixel(PT)).toEqual(COLOR)
    }
  })
})

describe("image with history support", () => {
  it("should do a simple undo", async () => {
    // create image
    const img = new SImage({ size: new Size(20, 20) })
    {
      img.appendLayer(new ImageLayer())
      img.appendFrame(new ImageFrame())
      img.getPixelSurface(img.layers()[0], img.frames()[0]).fillAll(0)
      // check history length
      expect(img.getHistoryLength()).toEqual(0)
      expect(img.getHistoryPosition()).toEqual(-1)
    }
    const PT = new Point(1, 2)
    {
      // change the image
      const surf = img.getPixelSurface(img.layers()[0], img.frames()[0])
      const old_data = surf.cloneData()
      const temp = new ArrayGridPixelSurface(new ArrayGrid<number>(20, 20))
      temp.setPixel(PT, 2)
      surf.copyPixelsFrom(temp.data, (v) => v >= 0)
      const new_data = surf.cloneData()
      // submit history
      img.appendHistory(new AreaChange(surf, old_data, new_data))
      // check history length
      expect(img.getHistoryLength()).toEqual(1)
      // check change happened
      expect(img.getPixelSurface(img.layers()[0], img.frames()[0]).getPixel(PT)).toEqual(2)
    }

    {
      // undo
      img.undo()
      // check history length
      expect(img.getHistoryLength()).toEqual(1)
      // check current undo position
      expect(img.getHistoryPosition()).toEqual(-1)
      // check that change really undone
      expect(img.getPixelSurface(img.layers()[0], img.frames()[0]).getPixel(PT)).toEqual(0)
    }

    {
      // redo
      img.redo()
      // check history length
      expect(img.getHistoryLength()).toEqual(1)
      // check current undo position
      expect(img.getHistoryPosition()).toEqual(0)
      // check that change really redone
    }
  })
  it("should do a redo that nukes part of history", async () => {
    // create image
    // create image
    const image = new SImage({ size: new Size(20, 20) })
    image.appendLayer(new ImageLayer())
    image.appendFrame(new ImageFrame())
    {
      const surf = image.getPixelSurface(image.layers()[0], image.frames()[0])
      surf.fillAll(0)
      // check history length
      expect(image.getHistoryLength()).toEqual(0)
      expect(image.getHistoryPosition()).toEqual(-1)
    }
    // submit flood fill
    {
      const surf = image.getPixelSurface(image.layers()[0], image.frames()[0])
      const old_data = surf.cloneData()
      floodFill(surf, 0, 1, new Point(0, 0))
      const new_data = surf.cloneData()
      image.appendHistory(new AreaChange(surf, old_data, new_data))
    }
    // submit draw
    {
      const PT = new Point(5, 5)
      const surf = image.getPixelSurface(image.layers()[0], image.frames()[0])
      const old_data = surf.cloneData()
      {
        const temp = new ArrayGridPixelSurface(new ArrayGrid<number>(20, 20))
        temp.setPixel(PT, 2)
        surf.copyPixelsFrom(temp.data, (v) => v >= 0)
      }
      const new_data = surf.cloneData()
      image.appendHistory(new AreaChange(surf, old_data, new_data))
    }
    // verify state
    {
      const surf = image.getPixelSurface(image.layers()[0], image.frames()[0])
      expect(surf.getPixel(new Point(0, 0))).toEqual(1)
      expect(surf.getPixel(new Point(5, 5))).toEqual(2)
      expect(image.getHistoryLength()).toEqual(2)
      expect(image.getHistoryPosition()).toEqual(1)
    }
    // undo draw
    {
      image.undo()
      const surf = image.getPixelSurface(image.layers()[0], image.frames()[0])
      expect(surf.getPixel(new Point(0, 0))).toEqual(1)
      expect(surf.getPixel(new Point(5, 5))).toEqual(1)
      expect(image.getHistoryLength()).toEqual(2)
      expect(image.getHistoryPosition()).toEqual(0)
    }
    // undo flood fill
    {
      image.undo()
      const surf = image.getPixelSurface(image.layers()[0], image.frames()[0])
      expect(surf.getPixel(new Point(0, 0))).toEqual(0)
      expect(surf.getPixel(new Point(5, 5))).toEqual(0)
      expect(image.getHistoryLength()).toEqual(2)
      expect(image.getHistoryPosition()).toEqual(-1)
    }
    // redo flood fill
    {
      image.redo()
      const surf = image.getPixelSurface(image.layers()[0], image.frames()[0])
      expect(surf.getPixel(new Point(0, 0))).toEqual(1)
      expect(surf.getPixel(new Point(5, 5))).toEqual(1)
      expect(image.getHistoryLength()).toEqual(2)
      expect(image.getHistoryPosition()).toEqual(0)
    }
    // do eraser change
    {
      const surf = image.getPixelSurface(image.layers()[0], image.frames()[0])
      const old_data = surf.cloneData()
      {
        // const temp = new ArrayGridPixelSurface(new ArrayGrid<number>(20, 20))
        // temp.setPixel(PT, 2)
        // surf.copyPixelsFrom(temp.data, (v) => v >= 0)
        surf.setPixel(new Point(3, 3), -1)
      }
      const new_data = surf.cloneData()
      image.appendHistory(new AreaChange(surf, old_data, new_data))
    }
    // verify old draw is gone
    {
      const surf = image.getPixelSurface(image.layers()[0], image.frames()[0])
      expect(surf.getPixel(new Point(0, 0))).toEqual(1)
      expect(surf.getPixel(new Point(3, 3))).toEqual(-1)
      expect(surf.getPixel(new Point(5, 5))).toEqual(1)
      expect(image.getHistoryLength()).toEqual(2)
      expect(image.getHistoryPosition()).toEqual(1)
    }
  })
})

describe("image JSON support", () => {
  it("should save to json", async () => {
    const reg = get_class_registry()
    const img = new SImage({ size: new Size(10, 10), name: "foo" })
    img.appendLayer(new ImageLayer({ name: "layer one", opacity: 0.5, visible: true }))
    img.appendFrame(new ImageFrame({ name: "frame one", group: "group one" }))
    {
      const json = img.toJSON(reg)
      // console.log("Json", JSON.stringify(json.props, null, '   '))
      expect(json.class).toEqual("SImage")
      expect(json.props.layers.length).toEqual(1)
      expect(json.props.frames.length).toEqual(1)
      expect(json.props.name).toEqual("foo")
      expect(json.props.size).toEqual(new Size(10, 10))

      const json_layer: JsonOut<ImageLayer> = json.props.layers[0]
      expect(json_layer.class).toEqual("ImageLayer")
      expect(json_layer.props.opacity).toEqual(0.5)
      expect(json_layer.props.visible).toEqual(true)

      const json_frame: JsonOut<ImageFrame> = json.props.frames[0]
      expect(json_frame.class).toEqual("ImageFrame")
      expect(json_frame.props.name).toEqual("frame one")
      expect(json_frame.props.group).toEqual("group one")

      expect(json.props.buffers).toEqual({})
    }

    // fill with clear
    const surf = img.getPixelSurface(img.layers()[0], img.frames()[0])
    surf.fillAll(-1)

    {
      const json = img.toJSON(reg)
      // console.log("Json", JSON.stringify(json.props, null, '   '))
      const layer = img.layers()[0]
      const frame = img.frames()[0]
      const buff = img.getBuffer(layer, frame)
      const key = layer.getUUID() + "_" + frame.getUUID()
      expect(key in json.props.buffers).toBeTruthy()
      const json_buff = json.props.buffers[key] as ArrayGridNumberJSON
      expect(json_buff.w).toEqual(buff.w)
      expect(json_buff.h).toEqual(buff.h)
      expect(json_buff.data.data[2]).toEqual(-1)
    }
  })
  it("should load from json", async () => {
    const reg = get_class_registry()
    const img = new SImage({ size: new Size(10, 10), name: "foo" })
    const PT = new Point(5, 5)
    const COLOR = 5
    {
      img.appendLayer(new ImageLayer({ name: "layer one", opacity: 0.5, visible: true }))
      img.appendFrame(new ImageFrame({ name: "frame one", group: "group one" }))
      const surf = img.getPixelSurface(img.layers()[0], img.frames()[0])
      surf.fillAll(-1)
      surf.setPixel(PT, COLOR)
    }

    const json = img.toJSON(reg)
    {
      const img2: SImage = restoreClassFromJSON(reg, json)
      expect(img2 instanceof SImage).toBeTruthy()
      const buff = img2.getBuffer(img2.layers()[0], img2.frames()[0])
      const surf = img2.getPixelSurface(img2.layers()[0], img2.frames()[0])
      expect(surf.size()).toEqual(img.getPropValue("size"))
      expect(surf.getPixel(PT)).toEqual(COLOR)
    }
  })
})
