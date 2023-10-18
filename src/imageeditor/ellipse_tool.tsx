import { ArrayGrid, Bounds, Point } from "josh_js_util"
import React from "react"

import { useWatchAllProps } from "../model/base"
import { BooleanDef } from "../model/datamodel"
import { PixelTool } from "./pixel_tool"
import { Tool, ToolEvent } from "./tool"

type EllipseToolSettingsType = {
  filled: boolean
}

export function drawEllipse(
  layer: ArrayGrid<number>,
  color: number,
  start: Point,
  end: Point,
  selection: Bounds | undefined,
) {
  console.log("drawing ellispe", layer, color, start, end, selection)

  function setPixel(pt: Point) {
    // if (selection) {
    //     if (selection.contains(pt)) {
    //         layer.set(pt, color)
    //     }
    // } else {
    layer.set(pt, color)
    // }
  }

  function ellipse_points(x0: number, y0: number, x: number, y: number) {
    setPixel(new Point(x0 + x, y0 + y))
    setPixel(new Point(x0 - x, y0 + y))
    setPixel(new Point(x0 + x, y0 - y))
    setPixel(new Point(x0 - x, y0 - y))
  }

  function rasterize(x0: number, y0: number, a: number, b: number) {
    console.log("rasterinzing", x0, y0, a, b)
    const a2 = a * a
    const b2 = b * b

    let d = 4 * b2 - 4 * b * a2 + a2
    let delta_A = 4 * 3 * b2
    let delta_B = 4 * (3 * b2 - 2 * b * a2 + 2 * a2)

    const limit = (a2 * a2) / (a2 + b2)

    let x = 0
    let y = b
    while (true) {
      // if (hw)
      ellipse_points(x0, y0, x, y)
      ellipse_points(x0, y0, y, x)
      // else
      //     ellipse_points(ctx, x0, y0, y, x, color)

      if (x * x >= limit) break

      if (d > 0) {
        d += delta_B
        delta_A += 4 * 2 * b2
        delta_B += 4 * (2 * b2 + 2 * a2)

        x += 1
        y -= 1
      } else {
        d += delta_A
        delta_A += 4 * 2 * b2
        delta_B += 4 * 2 * b2

        x += 1
      }
    }
  }

  start = start.floor()
  end = end.floor()
  if (start.x == end.x && start.y == end.y) {
    return
  }
  {
    const x0 = start.x
    const y0 = start.y
    const a = end.x - start.x
    const b = end.y - start.y
    rasterize(x0, y0, a, b)
  }
}

export class EllipseTool
  extends PixelTool<EllipseToolSettingsType>
  implements Tool
{
  constructor() {
    super({ filled: BooleanDef }, { filled: false })
    this.name = "ellipse"
  }

  drawPixels(evt: ToolEvent, target: ArrayGrid<number>, final: boolean) {
    if (!final) target.fill(() => -1)
    if (this.getPropValue("filled")) {
      drawEllipse(
        target,
        evt.color,
        this._start.floor(),
        this._current.floor(),
        evt.selection,
      )
    } else {
      drawEllipse(
        target,
        evt.color,
        this._start.floor(),
        this._current.floor(),
        evt.selection,
      )
    }
  }
}

export function EllipseToolSettings(props: { tool: EllipseTool }) {
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
