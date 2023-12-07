import { ArrayGrid, Point, Size } from "josh_js_util"
import { describe, expect, it } from "vitest"

import { FramePixelSurface, ImagePixelLayer, SImage } from "./image"

function wrap(point: Point, size: Size): Point {
  const pt = point.copy()
  if (point.x >= size.w) {
    pt.x = point.x % size.w
  }
  if (point.x < 0) {
    pt.x = (point.x + size.w) % size.w
  }
  if (point.y >= size.h) {
    pt.y = point.y % size.h
  }
  if (point.y < 0) {
    pt.y = (point.y + size.h) % size.h
  }
  return pt
}

describe("image with frames", () => {
  it("should create an image with one layer and three frames ", async () => {
    const img: SImage = new SImage({
      size: new Size(10, 10),
    })
    img.appendLayer(new ImagePixelLayer())
    expect(img.layers().length).to.eq(1)
    // expect(img.pixelLayers().length).to.eq(1)

    {
      // set one pixel in the layer
      const surface: FramePixelSurface = img.getFramePixelSurfaces(0)[0]
      surface.setPixel(new Point(0, 0), 8)
      expect(surface.getPixel(new Point(0, 0))).to.eq(8)
    }

    // add an empty frame so we have two frames
    expect(img.getPropValue("frameCount")).to.eq(1)
    img.addEmptyFrame()
    expect(img.getPropValue("frameCount")).to.eq(2)

    {
      // check pixel from first frame
      const l1 = img.getFramePixelSurfaces(0)[0]
      expect(l1.getPixel(new Point(0, 0))).to.eq(8)
      // check pixel from second frame
      const l2 = img.getFramePixelSurfaces(1)[0]
      expect(l2.getPixel(new Point(0, 0))).to.eq(-1)
    }
  })
  it("should draw to a layer using pixel copy", () => {
    const img: SImage = new SImage({
      size: new Size(10, 10),
    })
    const origin = new Point(0, 0)
    img.appendLayer(new ImagePixelLayer())
    const grid = new ArrayGrid<number>(3, 3)
    grid.fill(() => 5)
    expect(grid.get_at(0, 0)).toEqual(5)
    const layer = img.getFramePixelSurfaces(0)[0]
    expect(layer.getPixel(origin)).toEqual(-1)
    layer.copyPixelsFrom(grid, () => true)
    expect(layer.getPixel(origin)).toEqual(5)
  })
  it("should wrap point", () => {
    const point = new Point(4, 4)
    const size = new Size(10, 10)
    expect(wrap(point.add(new Point(1, 1)), size).x).toEqual(5)
    expect(wrap(point.add(new Point(6, 1)), size).x).toEqual(0)
    expect(wrap(point.add(new Point(8, 1)), size).x).toEqual(2)
    expect(wrap(point.add(new Point(-1, 0)), size).x).toEqual(3)
    expect(wrap(point.add(new Point(-4, 0)), size).x).toEqual(0)
    expect(wrap(point.add(new Point(-6, 0)), size).x).toEqual(8)
  })
  it("should move a layer with wrapping", () => {
    // create image with one layer
    const size = new Size(12, 10)
    const image = new SImage({ size: size })
    image.appendLayer(new ImagePixelLayer({ visible: true, opacity: 1.0 }))
    const surf = image.getFramePixelSurfaces(0)[0]
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
        surf.setPixel(wrap(n.add(off), size), v)
      })
      // check
      expect(surf.getPixel(LEFT)).toEqual(2)
    }
    {
      // move by two pixels right
      const off = new Point(2, 0)
      pixels.forEach((v, n) => {
        surf.setPixel(wrap(n.add(off), size), v)
      })
      expect(surf.getPixel(LEFT)).toEqual(1)
      expect(surf.getPixel(RIGHT)).toEqual(1)
    }
  })
})
