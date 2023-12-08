import { Point } from "josh_js_util"
import React from "react"

import { PropsBase, useWatchAllProps } from "../model/base"
import { FramePixelSurface } from "../model/image"
import { PixelTool, PixelToolEvent, PixelToolKeyEvent } from "./tool"

type FillToolSettingsType = object

function calculateDirections() {
  return [new Point(-1, 0), new Point(1, 0), new Point(0, -1), new Point(0, 1)]
}

export function floodFill(surf: FramePixelSurface, target: number, replace: number, at: Point) {
  const stack = [at]
  while (stack.length > 0) {
    const pos = stack.pop() as Point
    if (surf.getPixel(pos) === target) {
      surf.setPixel(pos, replace)
      calculateDirections()
        .map((dir) => pos.add(dir))
        .filter((pt) => surf.isValidIndex(pt))
        .forEach((pt) => stack.push(pt))
    }
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
      floodFill(evt.surface, evt.surface.getPixel(evt.pt), evt.color, evt.pt.floor())
      evt.markDirty()
    }
  }

  onMouseMove(): void {}

  onMouseUp(): void {}

  onKeyDown(evt: PixelToolKeyEvent): void {}
}

export function FillToolSettings(props: { tool: FillTool }) {
  useWatchAllProps(props.tool)
  return <div></div>
}
