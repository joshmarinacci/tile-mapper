import { ArrayGrid, Point, Size } from "josh_js_util"
import { describe, expect, it } from "vitest"

import { floodFill } from "../imageeditor/fill_tool"
import { wrapPoint } from "../util"
import {
  AreaChange,
  ArrayGridPixelSurface,
  FramePixelSurface,
  ImageFrame,
  ImageLayer,
  SImage,
} from "./image"

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
