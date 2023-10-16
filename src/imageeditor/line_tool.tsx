import {ArrayGrid, Point} from "josh_js_util"
import React from "react"

import {useWatchAllProps} from "../model/base"
import {BooleanDef} from "../model/datamodel"
import {PixelTool} from "./pixel_tool"
import {Tool, ToolEvent} from "./tool"

type LineToolSettingsType = {
    constrain: boolean;
};

export function drawLine(
    data: ArrayGrid<number>,
    color: number,
    start: Point,
    end: Point) {
    const x1 = end.x
    const x0 = start.x
    const y1 = end.y
    const y0 = start.y
    let dx = x1 - x0
    let dy = y1 - y0

    const inc_x = dx >= 0 ? +1 : -1
    const inc_y = dy >= 0 ? +1 : -1

    dx = dx < 0 ? -dx : dx
    dy = dy < 0 ? -dy : dy

    if (dx >= dy) {
        let d = 2 * dy - dx
        const delta_A = 2 * dy
        const delta_B = 2 * dy - 2 * dx

        let x = 0
        let y = 0
        for (let i = 0; i <= dx; i++) {
            data.set(new Point(x + x0, y + y0), color)
            // put_pixel(ctx, x + x0, y + y0, "black")
            if (d > 0) {
                d += delta_B
                x += inc_x
                y += inc_y
            } else {
                d += delta_A
                x += inc_x
            }
        }
    } else {
        let d = 2 * dx - dy
        const delta_A = 2 * dx
        const delta_B = 2 * dx - 2 * dy

        let x = 0
        let y = 0
        for (let i = 0; i <= dy; i++) {
            data.set(new Point(x + x0, y + y0), color)
            // put_pixel(ctx, x + x0, y + y0, "black")
            if (d > 0) {
                d += delta_B
                x += inc_x
                y += inc_y
            } else {
                d += delta_A
                y += inc_y
            }
        }
    }
}

export class LineTool extends PixelTool<LineToolSettingsType> implements Tool {
    constructor() {
        super({constrain: BooleanDef}, {constrain: false})
        this.name = "line"
    }

    drawPixels(evt: ToolEvent, target:ArrayGrid<number>, final:boolean) {
        if(!final) target.fill(()=>-1)
        drawLine(target, evt.color, this._start.floor(), this._current.floor())
    }

}

export function LineToolSettings(props: { tool: LineTool }) {
    useWatchAllProps(props.tool)
    return <div></div>
}
