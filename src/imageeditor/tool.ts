import { Bounds, Point } from "josh_js_util"
import React from "react"

import { ImagePalette } from "../common/common"
import { SImageLayer } from "../model/datamodel"

export type ToolEvent = {
  pt: Point // in image coords
  e: React.MouseEvent<HTMLCanvasElement> // in screen coords
  color: number //currently selected color
  palette: ImagePalette
  layer: SImageLayer | undefined // currently selected layer
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

export interface Tool {
  name: string

  onMouseDown(evt: ToolEvent): void

  onMouseMove(evt: ToolEvent): void

  onMouseUp(evt: ToolEvent): void

  drawOverlay(ovr: ToolOverlayInfo): void
}
