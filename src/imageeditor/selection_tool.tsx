import { Bounds } from "josh_js_util"
import React from "react"

import { PropsBase, useWatchAllProps } from "../model/base"
import { PixelTool, PixelToolEvent, PixelToolKeyEvent } from "./tool"

type SelectionToolSettingsType = object

export class SelectionTool extends PropsBase<SelectionToolSettingsType> implements PixelTool {
  name: string
  private down: boolean

  constructor() {
    super({}, {})
    this.name = "selection"
    this.down = false
  }

  onKeyDown(evt: PixelToolKeyEvent): void {
    throw new Error("Method not implemented.")
  }

  drawOverlay(): void {}

  onMouseDown(evt: PixelToolEvent): void {
    if (!evt.layer) return
    this.down = true
    const selection = new Bounds(evt.pt.floor().x, evt.pt.floor().y, 0, 0)
    // this.selection.x = evt.pt.floor().x
    // this.selection.y = evt.pt.floor().y
    evt.setSelectionRect(selection)
    evt.markDirty()
  }

  onMouseMove(evt: PixelToolEvent): void {
    if (!evt.layer) return
    if (!this.down) return
    const pt = evt.pt.floor()
    if (evt.selection) {
      const selection = new Bounds(
        evt.selection.x,
        evt.selection.y,
        pt.x - evt.selection.x,
        pt.y - evt.selection.y,
      )
      evt.setSelectionRect(selection)
      evt.markDirty()
    }
  }

  onMouseUp(evt: PixelToolEvent): void {
    if (!evt.layer) return
    this.down = false
    const pt = evt.pt.floor()
    if (evt.selection) {
      const selection = new Bounds(
        evt.selection.x,
        evt.selection.y,
        pt.x - evt.selection.x,
        pt.y - evt.selection.y,
      )
      if (selection.w < 1 || selection.h < 1) {
        evt.setSelectionRect(undefined)
      } else {
        evt.setSelectionRect(selection)
      }
      evt.markDirty()
    }
  }
}

export function SelectionToolSettings(props: { tool: SelectionTool }) {
  useWatchAllProps(props.tool)
  return <div></div>
}
