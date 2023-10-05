import {ArrayGrid, Bounds, Point} from "josh_js_util"
import React from "react"

import {PropsBase, useWatchAllProps} from "../model/base"
import {Tool, ToolEvent, ToolOverlayInfo} from "./tool"

type MoveToolSettingsType = {}

function copyContentsFrom(src:ArrayGrid<number>, range: Bounds, temp: ArrayGrid<number>, offset:Point) {
    console.log("copying from",range,'with offset',offset)
    temp.forEach((v,n) => {
        const vv = src.get(n.add(range.position()))
        temp.set(n.add(offset),vv)
    })
}

export class MoveTool extends PropsBase<MoveToolSettingsType> implements Tool {
    name: string
    private down: boolean
    private start: Point
    private temp: ArrayGrid<number>
    constructor() {
        super({}, {})
        this.name = 'move'
        this.down = false
        this.temp = new ArrayGrid<number>(0,0)
        this.start = new Point(0,0)
    }

    drawOverlay(ovr: ToolOverlayInfo): void {
        console.log("temp buffer is",this.temp.w, this.temp.h)
        const ctx = ovr.ctx
        const palette = ovr.palette
        const scale = ovr.scale
        console.log('drawing at')
        ctx.save()
        ctx.translate(this.start.x*scale,this.start.y*scale)
        this.temp.forEach((n, p) => {
            ctx.fillStyle = palette.colors[n]
            if (n === -1) ctx.fillStyle = 'transparent'
            ctx.fillRect(p.x * scale, p.y * scale, 1 * scale, 1 * scale)
        })
        ctx.restore()
    }

    onMouseDown(evt: ToolEvent): void {
        // if inside selection
        if(evt.selection && evt.selection.contains(evt.pt) && evt.layer) {
            console.log('starting mvoe at', evt.pt)
            this.down = true
            this.start = evt.pt
            const size = evt.selection.size()
            // copy selection to a temp layer drawn in the overlay
            this.temp = new ArrayGrid<number>(size.w,size.h)
            copyContentsFrom(evt.layer.getPropValue('data'),evt.selection,this.temp, new Point(0,0))
            evt.markDirty()
        }
        // otherwise do nothing
    }

    onMouseMove(evt: ToolEvent): void {
        if(this.down && evt.selection) {
            this.start = evt.pt
            evt.setSelectionRect(new Bounds(
                this.start.x,
                this.start.y,
                evt.selection.w,
                evt.selection.h
            ))
            evt.markDirty()
        }
    }

    onMouseUp(evt: ToolEvent): void {
        if(this.down && evt.layer) {
            this.start = evt.pt
            //copy the temp back to the layer
            const layer_data = evt.layer.getPropValue('data')
            copyContentsFrom(this.temp,new Bounds(0,0,this.temp.w,this.temp.h),layer_data, this.start)
            evt.layer.setPropValue('data',layer_data)
            evt.markDirty()
        }
        this.down = false
        this.start = new Point(0,0)
        this.temp = new ArrayGrid<number>(0,0)
    }
}
export function MoveToolSettings(props: { tool: MoveTool }) {
    useWatchAllProps(props.tool)
    return <div>
    </div>
}
