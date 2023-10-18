import { ArrayGrid, Bounds, Point } from "josh_js_util"
import React from "react"

import { useWatchAllProps } from "../model/base"
import { BooleanDef } from "../model/datamodel"
import { PixelTool } from "./pixel_tool"
import { Tool, ToolEvent } from "./tool"

type RectToolSettingsType = {
  filled: boolean
}

export function drawRect(
  layer: ArrayGrid<number>,
  color: number,
  start: Point,
  end: Point,
  selection: Bounds | undefined,
) {
  const i1 = Math.min(start.x, end.x)
  const i2 = Math.max(start.x, end.x)
  const j1 = Math.min(start.y, end.y)
  const j2 = Math.max(start.y, end.y)

  for (let i = i1; i < i2; i++) {
    setPixel(new Point(i, j1), layer, color, selection)
    setPixel(new Point(i, j2), layer, color, selection)
  }
  for (let j = j1; j < j2; j++) {
    setPixel(new Point(i1, j), layer, color, selection)
    setPixel(new Point(i2, j), layer, color, selection)
  }
}

function setPixel(
  point: Point,
  layer: ArrayGrid<number>,
  color: number,
  selection: Bounds | undefined,
) {
  if (selection) {
    if (selection.contains(point)) {
      layer.set(point, color)
    }
  } else {
    layer.set(point, color)
  }
}

export function fillRect(
  layer: ArrayGrid<number>,
  color: number,
  start: Point,
  end: Point,
  selection: Bounds | undefined,
) {
  const i1 = Math.min(start.x, end.x)
  const i2 = Math.max(start.x, end.x)
  const j1 = Math.min(start.y, end.y)
  const j2 = Math.max(start.y, end.y)
  for (let i = i1; i < i2; i++) {
    for (let j = j1; j < j2; j++) {
      setPixel(new Point(i, j), layer, color, selection)
    }
  }
}

export class RectTool extends PixelTool<RectToolSettingsType> implements Tool {
  constructor() {
    super({ filled: BooleanDef }, { filled: false })
    this.name = "rect"
  }

  drawPixels(evt: ToolEvent, target: ArrayGrid<number>, final: boolean) {
    if (!final) target.fill(() => -1)
    if (this.getPropValue("filled")) {
      fillRect(
        target,
        evt.color,
        this._start.floor(),
        this._current.floor(),
        evt.selection,
      )
    } else {
      drawRect(
        target,
        evt.color,
        this._start.floor(),
        this._current.floor(),
        evt.selection,
      )
    }
  }
}

export function RectToolSettings(props: { tool: RectTool }) {
  useWatchAllProps(props.tool)
  return (
    <div>
      <label>filled</label>
      <input
        type={"checkbox"}
        checked={props.tool.getPropValue("filled")}
        onChange={(e) => {
          const v = e.target.checked
          props.tool.setPropValue("filled", v)
        }}
      />
    </div>
  )
}
