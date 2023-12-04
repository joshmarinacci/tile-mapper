import { Point, Size } from "josh_js_util"
import { describe, expect, it } from "vitest"

import { ImagePixelLayer, SImage } from "../model/image"
import { drawEllipse } from "./ellipse_tool"
import { drawRect } from "./rect_tool"

describe("basic drawing", () => {
  it("should fill the canvas", async () => {
    const canvas = new SImage({ size: new Size(50, 50) })
    const layer = new ImagePixelLayer({ visible: true, opacity: 1.0 })
    canvas.appendLayer(layer)
    // layer.rebuildFromCanvas(canvas)

    const surf = canvas.getFramePixelSurface(layer, 0)
    surf.fillAll(0)
    expect(surf.getPixel(new Point(0, 0))).toBe(0)
    surf.fillAll(12)
    expect(surf.getPixel(new Point(0, 0))).toBe(12)
  })
  it("should draw a rectangle", async () => {
    const canvas = new SImage({ size: new Size(50, 50) })
    canvas.appendLayer(new ImagePixelLayer({ visible: true, opacity: 1.0 }))

    //normal rect
    {
      const surf = canvas.getFramePixelSurfaces(0)[0]
      surf.fillAll(0)
      drawRect(surf, 12, new Point(0, 0), new Point(20, 20), undefined)
      expect(surf.getPixel(new Point(0, 0))).toBe(12)
      expect(surf.getPixel(new Point(1, 0))).toBe(12)
      expect(surf.getPixel(new Point(18, 0))).toBe(12)
      expect(surf.getPixel(new Point(19, 0))).toBe(12)
      expect(surf.getPixel(new Point(20, 0))).toBe(12)
      expect(surf.getPixel(new Point(21, 0))).toBe(0)
      expect(surf.getPixel(new Point(1, 1))).toBe(0)
      expect(surf.getPixel(new Point(1, 20))).toBe(12)
      expect(surf.getPixel(new Point(18, 20))).toBe(12)
    }

    // inverse rect
    {
      const surf = canvas.getFramePixelSurfaces(0)[0]
      surf.fillAll(0)
      drawRect(surf, 12, new Point(20, 20), new Point(0, 0), undefined)
      expect(surf.getPixel(new Point(0, 0))).toBe(12)
      expect(surf.getPixel(new Point(20, 0))).toBe(12)
      expect(surf.getPixel(new Point(21, 0))).toBe(0)
    }

    // partly off-screen
    {
      const surf = canvas.getFramePixelSurfaces(0)[0]
      surf.fillAll(0)
      drawRect(surf, 12, new Point(-10, 0), new Point(20, 20), undefined)
      expect(surf.getPixel(new Point(0, 0))).toBe(12)
      expect(surf.getPixel(new Point(0, 1))).toBe(0)
    }
  })
  it("should draw an ellipse", async () => {
    const canvas = new SImage({ size: new Size(50, 50) })
    const layer = new ImagePixelLayer({ visible: true, opacity: 1.0 })
    canvas.appendLayer(layer)
    layer.rebuildFromCanvas(canvas)

    {
      layer.fillAll(0)
      drawEllipse(layer.getPropValue("data"), 13, new Point(0, 0), new Point(20, 20), undefined)
    }
  })
})
