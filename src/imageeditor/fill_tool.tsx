import { Point } from "josh_js_util"
import React from "react"

import { PropsBase, useWatchAllProps } from "../model/base"
import { SImageLayer } from "../model/datamodel"
import { Tool, ToolEvent, ToolOverlayInfo } from "./tool"

type FillToolSettingsType = {}

function calculateDirections() {
  return [new Point(-1, 0), new Point(1, 0), new Point(0, -1), new Point(0, 1)]
}

export function new_bucketFill(
  layer: SImageLayer,
  target: number,
  replace: number,
  at: Point,
) {
  if (target === replace) return
  const v = layer.getPixel(at)
  if (v !== target) return
  if (v === target) {
    layer.setPixel(at, replace)
    calculateDirections().forEach((dir) => {
      const pt = at.add(dir)
      if (layer.getPropValue("data").isValidIndex(pt))
        new_bucketFill(layer, target, replace, pt)
    })
  }
}

export class FillTool extends PropsBase<FillToolSettingsType> implements Tool {
  name: string

  constructor() {
    super({}, {})
    this.name = "fill"
  }

  drawOverlay(ovr: ToolOverlayInfo): void {}

  onMouseDown(evt: ToolEvent): void {
    if (evt.layer) {
      new_bucketFill(
        evt.layer,
        evt.layer.getPixel(evt.pt),
        evt.color,
        evt.pt.floor(),
      )
      evt.markDirty()
    }
  }

  onMouseMove(evt: ToolEvent): void {}

  onMouseUp(evt: ToolEvent): void {}
}

export function FillToolSettings(props: { tool: FillTool }) {
  useWatchAllProps(props.tool)
  return <div></div>
}
