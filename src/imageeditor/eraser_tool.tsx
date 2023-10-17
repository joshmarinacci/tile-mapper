import {ArrayGrid, Bounds, Point} from "josh_js_util"
import React from "react"

import { useWatchAllProps } from "../model/base"
import { IntegerDef } from "../model/datamodel"
import {PixelTool} from "./pixel_tool"
import { Tool, ToolEvent } from "./tool"

type EraserSettingsType = {
  tip_size: number;
};

export class EraserTool extends PixelTool<EraserSettingsType> implements Tool {

  constructor() {
    super({tip_size: IntegerDef},{tip_size: 3})
    this.name = "eraser"
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  drawPixels(evt: ToolEvent, target: ArrayGrid<number>, _final:boolean) {
    if (evt.layer) this.drawAtCursor(evt, target, this._current, evt.color, evt.selection)
  }

  private drawAtCursor(evt: ToolEvent,
                       layer:ArrayGrid<number>,
                       pt:Point,
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
    evt.markDirty()
  }
}

export function EraserToolSettings(props: { tool: EraserTool }) {
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
