import { ArrayGrid, Bounds, Point, Size } from "josh_js_util"
import React from "react"

import { useWatchAllProps } from "../model/base"
import { IntegerDef } from "../model/datamodel"
import { strokeBounds } from "../util"
import { BasePixelTool } from "./pixel_tool"
import { PixelTool, PixelToolEvent, ToolOverlayInfo } from "./tool"

type PencilSettingsType = {
  tip_size: number
}

export class PencilTool extends BasePixelTool<PencilSettingsType> implements PixelTool {
  constructor() {
    super({ tip_size: IntegerDef }, { tip_size: 1 })
    this.name = "pencil"
    this._down = false
  }

  drawPixels(evt: PixelToolEvent, target: ArrayGrid<number>, final: boolean) {
    if (evt.layer) {
      if (final) {
        this.temp.forEach((v, n) => {
          if (v >= 0) evt.layer.setPixel(n, v)
        })
      } else {
        this.drawAtCursor(target, this._current, evt.color, evt.selection)
      }
    }
  }

  drawOverlay(ovr: ToolOverlayInfo): void {
    super.drawOverlay(ovr)
    const size = this.getPropValue("tip_size")
    const rad = Math.floor(size / 2)
    const bds = Bounds.fromPointSize(this._current, new Size(size, size))
      .add(new Point(-rad, -rad))
      .scale(ovr.scale)
    strokeBounds(ovr.ctx, bds, "black", 1)
  }

  private drawAtCursor(
    layer: ArrayGrid<number>,
    pt: Point,
    color: number,
    selection: Bounds | undefined,
  ) {
    const size = this.getPropValue("tip_size")
    const rad = Math.floor(size / 2)
    for (let i = pt.x - rad; i <= pt.x + rad; i++) {
      for (let j = pt.y - rad; j <= pt.y + rad; j++) {
        if (selection) {
          if (selection.contains(new Point(i, j))) {
            layer.set(new Point(i, j), color)
          }
        } else {
          layer.set(new Point(i, j), color)
        }
      }
    }
  }
}

export function PencilToolSettings(props: { tool: PencilTool }) {
  useWatchAllProps(props.tool)
  return (
    <div>
      <input
        type={"number"}
        value={props.tool.getPropValue("tip_size")}
        onChange={(e) => {
          const v = parseInt(e.target.value)
          props.tool.setPropValue("tip_size", v)
        }}
      />
    </div>
  )
}
