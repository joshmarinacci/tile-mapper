import { Bounds, Point } from "josh_js_util"
import React from "react"

import { ImagePalette } from "../common/common"
import { FramePixelSurface, ImageLayer, SImage } from "../model/image"

export type PixelToolEvent = {
  pt: Point // in image coords
  e: React.MouseEvent<HTMLCanvasElement> // in screen coords
  color: number //currently selected color
  palette: ImagePalette
  layer: ImageLayer // currently selected layer
  image: SImage
  surface: FramePixelSurface
  markDirty: () => void
  selection: Bounds | undefined
  setSelectionRect: (selection: Bounds | undefined) => void
}
export type PixelToolKeyEvent = {
  e: React.KeyboardEvent<Element>
  palette: ImagePalette
  layer: ImageLayer // currently selected layer
  image: SImage
  surface: FramePixelSurface
  markDirty: () => void
  selection: Bounds | undefined
  setSelectionRect: (selection: Bounds | undefined) => void
  color: number
}
export type ToolOverlayInfo = {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  scale: number
  color: number
  palette: ImagePalette
}

export interface PixelTool {
  name: string

  onMouseDown(evt: PixelToolEvent): void

  onMouseMove(evt: PixelToolEvent): void

  onMouseUp(evt: PixelToolEvent): void

  drawOverlay(ovr: ToolOverlayInfo): void

  onKeyDown(evt: PixelToolKeyEvent): void
}
