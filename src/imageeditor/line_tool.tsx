import {ArrayGrid, Point} from "josh_js_util"
import React from "react"

import {PropsBase, useWatchAllProps} from "../model/base"
import {BooleanDef, SImageLayer} from "../model/datamodel"
import {Tool, ToolEvent, ToolOverlayInfo} from "./tool"

type LineToolSettingsType = {
    constrain: boolean
}

export function drawLine(data:ArrayGrid<number>, color: number, start: Point, end: Point) {
    const x1 = end.x
    const x0 = start.x
    const y1 = end.y
    const y0 = start.y
    let dx = x1 - x0
    let dy = y1 - y0

    const inc_x = (dx >= 0) ? +1 : -1
    const inc_y = (dy >= 0) ? +1 : -1

    dx = (dx < 0) ? -dx : dx
    dy = (dy < 0) ? -dy : dy

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

export class LineTool extends PropsBase<LineToolSettingsType> implements Tool {
    name: string
    private _down: boolean
    private _start: Point
    private _current: Point
    private temp: ArrayGrid<number>

    constructor() {
        super({
            constrain: BooleanDef,
        }, {
            constrain: false
        })
        this.name = 'line'
        this._down = false
        this._start = new Point(0, 0)
        this._current = new Point(0, 0)
        this.temp = new ArrayGrid<number>(1, 1)
    }

    drawOverlay(ovr: ToolOverlayInfo): void {
        if (this._down) {
            const ctx = ovr.ctx
            const palette = ovr.palette
            const scale = ovr.scale
            ctx.save()
            // ctx.translate(this._start.x * scale, this._start.y * scale)
            this.temp.forEach((n, p) => {
                ctx.fillStyle = palette.colors[n]
                if (n === -1) ctx.fillStyle = 'transparent'
                ctx.fillRect(p.x * scale, p.y * scale, 1 * scale, 1 * scale)
            })
            ctx.restore()
        }
    }

    onMouseDown(evt: ToolEvent): void {
        if (evt.layer) {
            this._down = true
            this._start = evt.pt.floor()
            this._current = evt.pt.floor()
            const data = evt.layer.getPropValue('data')
            this.temp = new ArrayGrid<number>(data.w, data.h)
            this.temp.fill(()=>-1)
            this.temp.set(this._start,evt.color)
        }
    }

    onMouseMove(evt: ToolEvent): void {
        if (this._down) {
            this._current = evt.pt.floor()
            this.temp.fill(()=>-1)
            drawLine(this.temp,evt.color,this._start.floor(),this._current.floor())
            evt.markDirty()
        }
    }

    onMouseUp(evt: ToolEvent): void {
        this._down = false
        if (evt.layer) {
            drawLine(evt.layer.getPropValue('data'), evt.color, this._start.floor(), this._current.floor())
            this.temp.fill(()=>-1)
        }
        evt.markDirty()
    }

}

export function LineToolSettings(props: { tool: LineTool }) {
    useWatchAllProps(props.tool)
    return <div>
    </div>
}
