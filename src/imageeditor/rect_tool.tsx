import {Bounds, Point} from "josh_js_util"
import React from "react"

import {PropsBase, useWatchAllProps} from "../model/base"
import {BooleanDef, SImageLayer} from "../model/datamodel"
import {Tool, ToolEvent, ToolOverlayInfo} from "./tool"

type RectToolSettingsType = {
    filled:boolean
}


export function drawRect(layer: SImageLayer, color: number, start: Point, end: Point, selection:Bounds|undefined) {
    const i1 = Math.min(start.x, end.x)
    const i2 = Math.max(start.x, end.x)
    const j1 = Math.min(start.y, end.y)
    const j2 = Math.max(start.y, end.y)

    for (let i = i1; i < i2; i++) {
        setPixel(new Point(i,j1),layer,color,selection)
        setPixel(new Point(i,j2),layer,color,selection)
    }
    for (let j = j1; j < j2; j++) {
        setPixel(new Point(i1,j),layer,color,selection)
        setPixel(new Point(i2,j),layer,color,selection)
    }
}

function setPixel(point: Point, layer: SImageLayer, color: number, selection: Bounds | undefined) {
    if(selection) {
        if(selection.contains(point)) {
            layer.setPixel(point,color)
        }
    } else {
        layer.setPixel(point,color)
    }
}

export function fillRect(layer: SImageLayer, color: number, start: Point, end: Point, selection:Bounds|undefined) {
    const i1 = Math.min(start.x, end.x)
    const i2 = Math.max(start.x, end.x)
    const j1 = Math.min(start.y, end.y)
    const j2 = Math.max(start.y, end.y)
    for (let i = i1; i < i2; i++) {
        for (let j = j1; j < j2; j++) {
            setPixel(new Point(i,j),layer,color,selection)
        }
    }

}

export class RectTool extends PropsBase<RectToolSettingsType> implements Tool {
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
        this.name = 'rect'
        this.down = false
        this.start = new Point(0, 0)
        this.end = new Point(0, 0)
    }

    drawOverlay(ovr: ToolOverlayInfo): void {
        if (!this.down) return
        if(this.getPropValue('filled')) {
            ovr.ctx.fillStyle = ovr.palette.colors[ovr.color]
            ovr.ctx.fillRect(this.start.x * ovr.scale, this.start.y * ovr.scale, (this.end.x - this.start.x) * ovr.scale, (this.end.y - this.start.y) * ovr.scale)
        } else {
            ovr.ctx.strokeStyle = ovr.palette.colors[ovr.color]
            ovr.ctx.lineWidth = 4
            ovr.ctx.beginPath()
            ovr.ctx.strokeRect(this.start.x * ovr.scale, this.start.y * ovr.scale, (this.end.x - this.start.x) * ovr.scale, (this.end.y - this.start.y) * ovr.scale)
        }
    }

    onMouseDown(evt: ToolEvent): void {
        this.down = true
        this.start = evt.pt.floor()
        this.end = evt.pt.floor()
        evt.markDirty()
    }

    onMouseMove(evt: ToolEvent): void {
        if (this.down) {
            this.end = evt.pt.floor()
            evt.markDirty()
        }
    }

    onMouseUp(evt: ToolEvent): void {
        this.down = false
        if (evt.layer) {
            if(this.getPropValue('filled')) {
                fillRect(evt.layer, evt.color, this.start, this.end, evt.selection)
            } else {
                drawRect(evt.layer, evt.color, this.start, this.end, evt.selection)
            }
        }
    }
}

export function RectToolSettings(props: { tool: RectTool }) {
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
