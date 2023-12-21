import { Bounds, Point } from "josh_js_util"

import { ImagePalette } from "../common/common"
import { GameDoc } from "../model/gamedoc"
import { FramePixelSurface, ImageFrame, ImageLayer, SImage } from "../model/image"
import { clamp, strokeBounds } from "../util"
import { PixelTool } from "./tool"

function drawPixelLayer(
  ctx: CanvasRenderingContext2D,
  layer: ImageLayer,
  surf: FramePixelSurface,
  palette: ImagePalette,
  scale: number,
) {
  ctx.save()
  ctx.globalAlpha = clamp(layer.opacity(), 0, 1)
  surf.forEach((n: number, p: Point) => {
    ctx.fillStyle = palette.colors[n]
    if (n === -1) ctx.fillStyle = "transparent"
    ctx.fillRect(p.x * scale, p.y * scale, 1 * scale, 1 * scale)
  })
  ctx.restore()
}

export function drawImage(
  doc: GameDoc,
  ctx: CanvasRenderingContext2D,
  image: SImage,
  palette: ImagePalette,
  scale: number,
  frame: ImageFrame,
) {
  image.layers().forEach((layer) => {
    if (!layer.visible()) return
    const surf = image.getPixelSurface(layer, frame)
    drawPixelLayer(ctx, layer, surf, palette, scale)
  })
}

export function drawCanvas(
  doc: GameDoc,
  canvas: HTMLCanvasElement,
  scale: number,
  grid: boolean,
  image: SImage,
  palette: ImagePalette,
  tool: PixelTool,
  drawColor: number,
  selectionRect: Bounds | undefined,
  frame: ImageFrame,
) {
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D
  ctx.fillStyle = "magenta"
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  drawImage(doc, ctx, image, palette, scale, frame)
  const size = image.size()
  if (grid) {
    ctx.strokeStyle = "black"
    ctx.lineWidth = 0.5
    ctx.beginPath()
    for (let i = 0; i < size.w; i++) {
      ctx.moveTo(i * scale, 0)
      ctx.lineTo(i * scale, size.h * scale)
    }
    for (let j = 0; j < size.h; j++) {
      ctx.moveTo(0, j * scale)
      ctx.lineTo(size.w * scale, j * scale)
    }
    ctx.stroke()
  }
  if (tool) {
    tool.drawOverlay({
      canvas: canvas,
      ctx: ctx,
      scale: scale,
      color: drawColor,
      palette: palette,
    })
  }
  if (selectionRect) {
    const bounds = selectionRect.scale(scale)
    ctx.setLineDash([5, 5])
    strokeBounds(ctx, bounds, "black", 1)
    ctx.setLineDash([])
  }
}
