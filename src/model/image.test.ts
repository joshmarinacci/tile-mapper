import { ArrayGrid, Point, Size } from "josh_js_util"
import { describe, expect, it } from "vitest"

import { FramePixelSurface, ImagePixelLayer, SImage } from "./image"

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
})
