import { Point, Size } from "josh_js_util"
import { describe, expect, it } from "vitest"

import { ImageFrame, ImageLayer, SImage } from "../model/image"
import { drawEllipse } from "./ellipse_tool"
import { floodFill } from "./fill_tool"
import { drawLine } from "./line_tool"
import { drawRect } from "./rect_tool"

describe("basic drawing", () => {
  it("should fill the canvas", async () => {
    const canvas = new SImage({ size: new Size(50, 50) })
    const layer = new ImageLayer({ visible: true, opacity: 1.0 })
    canvas.appendLayer(layer)
    const frame = new ImageFrame()
    canvas.appendFrame(frame)

    const surf = canvas.getPixelSurface(canvas.layers()[0], canvas.frames()[0])
    surf.fillAll(0)
    expect(surf.getPixel(new Point(0, 0))).toBe(0)
    surf.fillAll(12)
    expect(surf.getPixel(new Point(0, 0))).toBe(12)
  })
  it("should draw a line", async () => {
    const canvas = new SImage({ size: new Size(50, 50) })
    canvas.appendLayer(new ImageLayer({ visible: true, opacity: 1.0 }))
    canvas.appendFrame(new ImageFrame())
    const surf = canvas.getPixelSurface(canvas.layers()[0], canvas.frames()[0])
    surf.fillAll(0)
    expect(surf.getPixel(new Point(0, 0))).toBe(0)
    drawLine(surf, 1, new Point(0, 0), new Point(10, 10))
    expect(surf.getPixel(new Point(0, 0))).toBe(1)
  })
  it("should draw a rectangle", async () => {
    const canvas = new SImage({ size: new Size(50, 50) })
    canvas.appendLayer(new ImageLayer({ visible: true, opacity: 1.0 }))
    canvas.appendFrame(new ImageFrame())

    //normal rect
    {
      const surf = canvas.getPixelSurface(canvas.layers()[0], canvas.frames()[0])
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
      const surf = canvas.getPixelSurface(canvas.layers()[0], canvas.frames()[0])
      surf.fillAll(0)
      drawRect(surf, 12, new Point(20, 20), new Point(0, 0), undefined)
      expect(surf.getPixel(new Point(0, 0))).toBe(12)
      expect(surf.getPixel(new Point(20, 0))).toBe(12)
      expect(surf.getPixel(new Point(21, 0))).toBe(0)
    }

    // partly off-screen
    {
      const surf = canvas.getPixelSurface(canvas.layers()[0], canvas.frames()[0])
      surf.fillAll(0)
      drawRect(surf, 12, new Point(-10, 0), new Point(20, 20), undefined)
      expect(surf.getPixel(new Point(0, 0))).toBe(12)
      expect(surf.getPixel(new Point(0, 1))).toBe(0)
    }
  })
  it("should draw an ellipse", async () => {
    const canvas = new SImage({ size: new Size(50, 50) })
    const layer = new ImageLayer({ visible: true, opacity: 1.0 })
    canvas.appendFrame(new ImageFrame())
    canvas.appendLayer(layer)
    {
      const surf = canvas.getPixelSurface(canvas.layers()[0], canvas.frames()[0])
      surf.fillAll(0)
      drawEllipse(surf, 13, new Point(0, 0), new Point(20, 20), undefined)
    }
  })
  it("should flood fill", async () => {
    const canvas = new SImage({ size: new Size(50, 50) })
    canvas.appendLayer(new ImageLayer({ visible: true, opacity: 1.0 }))
    canvas.appendFrame(new ImageFrame())
    const surf = canvas.getPixelSurface(canvas.layers()[0], canvas.frames()[0])
    surf.fillAll(1)
    expect(surf.getPixel(new Point(0, 0))).toBe(1)
    floodFill(surf, 0, 2, new Point(0, 0))
    expect(surf.getPixel(new Point(0, 0))).toBe(1)
    floodFill(surf, 1, 2, new Point(0, 0))
    expect(surf.getPixel(new Point(0, 0))).toBe(2)

    surf.fillAll(1)
    expect(surf.getPixel(new Point(0, 0))).toBe(1)
    drawRect(surf, 3, new Point(5, 5), new Point(10, 10), undefined)
    expect(surf.getPixel(new Point(0, 0))).toBe(1)
    expect(surf.getPixel(new Point(5, 5))).toBe(3)
    floodFill(surf, 1, 2, new Point(7, 7))
    expect(surf.getPixel(new Point(0, 0))).toBe(1)
    expect(surf.getPixel(new Point(6, 6))).toBe(2)
  })
})
