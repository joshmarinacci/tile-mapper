import { Point } from "josh_js_util"
import React from "react"

import { PropsBase, useWatchAllProps } from "../model/base"
import { ImagePixelLayer } from "../model/datamodel"
import { PixelTool, PixelToolEvent, ToolOverlayInfo } from "./tool"

type FillToolSettingsType = object

function calculateDirections() {
  return [new Point(-1, 0), new Point(1, 0), new Point(0, -1), new Point(0, 1)]
}

export function new_bucketFill(layer: ImagePixelLayer, target: number, replace: number, at: Point) {
  if (target === replace) return
  const v = layer.getPixel(at)
  if (v !== target) return
  if (v === target) {
    layer.setPixel(at, replace)
    calculateDirections().forEach((dir) => {
      const pt = at.add(dir)
      if (layer.getPropValue("data").isValidIndex(pt)) new_bucketFill(layer, target, replace, pt)
    })
  }
}

export class FillTool extends PropsBase<FillToolSettingsType> implements PixelTool {
  name: string

  constructor() {
    super({}, {})
    this.name = "fill"
  }

  drawOverlay(): void {}

  onMouseDown(evt: PixelToolEvent): void {
    if (evt.layer) {
      new_bucketFill(evt.layer, evt.layer.getPixel(evt.pt), evt.color, evt.pt.floor())
      evt.markDirty()
    }
  }

  onMouseMove(): void {}

  onMouseUp(): void {}
}

export function FillToolSettings(props: { tool: FillTool }) {
  useWatchAllProps(props.tool)
  return <div></div>
}
