import { Bounds, Size } from "josh_js_util"

import { measureTextRun } from "../fonteditor/PixelFontPreview"
import { strokeBounds } from "../util"
import { ObjectTool, ObjectToolEvent, ObjectToolOverlayInfo } from "./tool"

export class MoveObjectTool implements ObjectTool {
  private down: boolean
  constructor() {
    this.down = false
  }
  onMouseDown(evt: ObjectToolEvent) {
    const obj = evt.layer.getPropValue("data").find((obj) => obj.contains(evt.pt))
    if (obj) {
      this.down = true
      console.log("found the object", obj)
      evt.setSelectedObject(obj)
      evt.markDirty()
    } else {
      evt.setSelectedObject(undefined)
      evt.markDirty()
    }
  }

  onMouseMove(evt: ObjectToolEvent) {
    if (evt.selectedObject && this.down) {
      const pos = evt.selectedObject
      pos.setPropValue("position", evt.pt)
    }
  }

  onMouseUp(evt: ObjectToolEvent) {
    this.down = false
  }

  drawOverlay(ovr: ObjectToolOverlayInfo) {
    if (ovr.selectedObject) {
      const text = ovr.selectedObject.getPropValue("text")
      const font_ref = ovr.selectedObject.getPropValue("font")
      const pt = ovr.selectedObject.getPropValue("position")
      let size = new Size(10, 10)
      if (font_ref) {
        const font = ovr.doc.getPropValue("fonts").find((fnt) => fnt.getUUID() === font_ref)
        if (font) {
          // drawTextRun(ctx, txt, font, scale, color)
          size = measureTextRun(text, font)
        }
      }
      const bounds = Bounds.fromPointSize(pt, size).scale(ovr.scale)
      strokeBounds(ovr.ctx, bounds, "white", 3)
    }
  }
}
