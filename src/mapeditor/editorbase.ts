import { Point } from "josh_js_util"
import React from "react"

import { GameDoc } from "../model/gamedoc"
import { ActorInstance } from "../model/gamemap"
import { Tile } from "../model/tile"

export type MouseEventArgs<T> = {
  e: React.MouseEvent<HTMLCanvasElement>
  layer: T
  pt: Point
  doc: GameDoc
  tile: Tile | undefined
  setSelectedTile: (tile: Tile) => void
  selectedActor?: ActorInstance
  setSelectedActor: (act: ActorInstance | undefined) => void
  fillOnce: boolean
  setFillOnce: (fillOnce: boolean) => void
}
export type DrawArgs<T> = {
  layer: T
  doc: GameDoc
  tile: Tile | undefined
  selectedActor?: ActorInstance
  ctx: CanvasRenderingContext2D
  scale: number
  grid: boolean
}

export interface MouseHandler<T> {
  onMouseDown(v: MouseEventArgs<T>): void

  onMouseMove(v: MouseEventArgs<T>): void

  onMouseUp(v: MouseEventArgs<T>): void

  drawOverlay(v: DrawArgs<T>): void
}
