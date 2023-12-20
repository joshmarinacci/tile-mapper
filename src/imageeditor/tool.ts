import { Bounds, Point } from "josh_js_util"
import React from "react"

import { ImagePalette } from "../common/common"
import { GameDoc } from "../model/gamedoc"
import { FramePixelSurface, ImageLayer, ImageObjectLayer, SImage, TextObject } from "../model/image"

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
  e: React.KeyboardEvent<HTMLCanvasElement>
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

export type ObjectToolOverlayInfo = {
  doc: GameDoc
  selectedObject: TextObject | undefined
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  scale: number
}
export type ObjectToolEvent = {
  layer: ImageObjectLayer // currently selected layer
  pt: Point // in image coords
  e: React.MouseEvent<HTMLCanvasElement> // in screen coords
  markDirty: () => void
  selectedObject: TextObject | undefined
  setSelectedObject: (obj: TextObject | undefined) => void
}
export interface ObjectTool {
  onMouseDown(evt: ObjectToolEvent): void
  onMouseMove(evt: ObjectToolEvent): void
  onMouseUp(evt: ObjectToolEvent): void
  drawOverlay(ovr: ObjectToolOverlayInfo): void
}
