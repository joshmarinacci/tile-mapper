import { Bounds, Point } from "josh_js_util"
import React from "react"

import { ImagePalette } from "../common/common"
import { GameDoc } from "../model/gamedoc"
import { ImageObjectLayer, ImagePixelLayer, TextObject } from "../model/image"

export type PixelToolEvent = {
  pt: Point // in image coords
  e: React.MouseEvent<HTMLCanvasElement> // in screen coords
  color: number //currently selected color
  palette: ImagePalette
  layer: ImagePixelLayer // currently selected layer
  markDirty: () => void
  selection: Bounds | undefined
  setSelectionRect: (selection: Bounds | undefined) => void
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
