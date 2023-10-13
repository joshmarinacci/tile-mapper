import { Bounds, Point } from "josh_js_util";
import React from "react";

import { PropsBase, useWatchAllProps } from "../model/base";
import { IntegerDef, SImageLayer } from "../model/datamodel";
import { Tool, ToolEvent, ToolOverlayInfo } from "./tool";

type PencilSettingsType = {
  tip_size: number;
};

export class PencilTool extends PropsBase<PencilSettingsType> implements Tool {
  name: string;
  private _down: boolean;
  private _cursor: Point;

  constructor() {
    super(
      {
        tip_size: IntegerDef,
      },
      {
        tip_size: 1,
      },
    );
    this.name = "pencil";
    this._down = false;
    this._cursor = new Point(-1, -1);
  }

  drawOverlay(ovr: ToolOverlayInfo): void {
    if (this._down) return;
    ovr.ctx.fillStyle = ovr.palette.colors[ovr.color];
    const size = this.getPropValue("tip_size");
    const rad = Math.floor(size / 2);
    ovr.ctx.fillRect(
      (this._cursor.x - rad) * ovr.scale,
      (this._cursor.y - rad) * ovr.scale,
      size * ovr.scale,
      size * ovr.scale,
    );
  }

  onMouseDown(evt: ToolEvent): void {
    this._down = true;
    this._cursor = evt.pt;
    if (evt.layer) {
      this.drawAtCursor(evt.layer, evt.pt, evt.color, evt.selection);
    }
  }

  onMouseMove(evt: ToolEvent): void {
    this._cursor = evt.pt;
    evt.markDirty();
    if (evt.layer && this._down) {
      this.drawAtCursor(evt.layer, evt.pt, evt.color, evt.selection);
    }
  }

  onMouseUp(evt: ToolEvent): void {
    this._cursor = evt.pt;
    this._down = false;
  }

  private drawAtCursor(
    layer: SImageLayer,
    pt: Point,
    color: number,
    selection: Bounds | undefined,
  ) {
    const size = this.getPropValue("tip_size");
    const rad = Math.floor(size / 2);
    for (let i = pt.x - rad; i <= pt.x + rad; i++) {
      for (let j = pt.y - rad; j <= pt.y + rad; j++) {
        if (selection) {
          if (selection.contains(new Point(i, j))) {
            layer.setPixel(new Point(i, j), color);
          }
        } else {
          layer.setPixel(new Point(i, j), color);
        }
      }
    }
  }
}

export function PencilToolSettings(props: { tool: PencilTool }) {
  useWatchAllProps(props.tool);
  return (
    <div>
      <input
        type={"number"}
        value={props.tool.getPropValue("tip_size")}
        onChange={(e) => {
          const v = parseInt(e.target.value);
          console.log("new width is", v);
          props.tool.setPropValue("tip_size", v);
        }}
      />
    </div>
  );
}
