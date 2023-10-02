import {Point} from "josh_js_util"
import React from "react"

import {PropsBase, useWatchAllProps} from "../model/base"
import {BooleanDef, SImageLayer} from "../model/datamodel"
import {Tool, ToolEvent, ToolOverlayInfo} from "./tool"

type EllipseToolSettingsType = {
    filled:boolean
}

export function drawEllipse(layer: SImageLayer, color: number, start: Point, end: Point) {
    function ellipse_points(x0: number, y0: number, x: number, y: number, color: number) {
        layer.setPixel(new Point(x0 + x, y0 + y), color)
        layer.setPixel(new Point(x0 - x, y0 + y), color)
        layer.setPixel(new Point(x0 + x, y0 - y), color)
        layer.setPixel(new Point(x0 - x, y0 - y), color)
    }

    function rasterize(x0: number, y0: number, a: number, b: number, color: number) {
        const a2 = a * a
        const b2 = b * b

        let d = 4 * b2 - 4 * b * a2 + a2
        let delta_A = 4 * 3 * b2
        let delta_B = 4 * (3 * b2 - 2 * b * a2 + 2 * a2)

        const limit = (a2 * a2) / (a2 + b2)

        let x = 0
        let y = b
        while (true) {
            // if (hw)
            ellipse_points(x0, y0, x, y, color)
            ellipse_points(x0, y0, y, x, color)
            // else
            //     ellipse_points(ctx, x0, y0, y, x, color)

            if (x * x >= limit)
                break

            if (d > 0) {
                d += delta_B
                delta_A += 4 * 2 * b2
                delta_B += 4 * (2 * b2 + 2 * a2)

                x += 1
                y -= 1
            } else {
                d += delta_A
                delta_A += 4 * 2 * b2
                delta_B += 4 * 2 * b2

                x += 1
            }
        }
    }


    start = start.floor()
    end = end.floor()
    const x0 = start.x
    const y0 = start.y
    const a = end.x - start.x
    const b = end.y - start.y
    rasterize(x0, y0, a, b, color)
}

export class EllipseTool extends PropsBase<EllipseToolSettingsType> implements Tool {
    name: string
    private down: boolean
    private start: Point
    private end: Point

    constructor() {
        super({
            filled: BooleanDef,
        },{
            filled: false
        })
        this.name = 'ellipse'
        this.down = false
        this.start = new Point(0, 0)
        this.end = new Point(0, 0)
    }

    drawOverlay(ovr: ToolOverlayInfo): void {
        if (!this.down) return
        ovr.ctx.strokeStyle = ovr.palette.colors[ovr.color]
        ovr.ctx.lineWidth = 4
        ovr.ctx.beginPath()
        const scale = ovr.scale
        const start = this.start
        const end = this.end
        const i1 = Math.min(start.x, end.x)
        const i2 = Math.max(start.x, end.x)
        const j1 = Math.min(start.y, end.y)
        const j2 = Math.max(start.y, end.y)
        ovr.ctx.moveTo(i1 * scale, j1 * scale)
        ovr.ctx.lineTo(i2 * scale, j2 * scale)
        ovr.ctx.ellipse(
            i1 * scale,
            j1 * scale,
            (i2 - i1) * scale,
            (j2 - j1) * scale,
            0, 0, Math.PI * 2)
        ovr.ctx.stroke()
    }

    onMouseDown(evt: ToolEvent): void {
        this.down = true
        this.start = evt.pt
        this.end = evt.pt
        evt.markDirty()
    }

    onMouseMove(evt: ToolEvent): void {
        if (this.down) {
            this.end = evt.pt
            evt.markDirty()
        }
    }

    onMouseUp(evt: ToolEvent): void {
        this.down = false
        if (evt.layer) {
            drawEllipse(evt.layer, evt.color, this.start, this.end)
        }
    }
}

export function EllipseToolSettings(props: { tool: EllipseTool }) {
    useWatchAllProps(props.tool)
    return <div>
        <label>filled</label>
        <input type={'checkbox'}
               checked={props.tool.getPropValue('filled')}
               onChange={(e) => {
                   const v = e.target.checked
                   props.tool.setPropValue("filled", v)
               }}/>
    </div>
}
