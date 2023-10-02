import {Bounds} from "josh_js_util"
import React from "react"

import {strokeBounds} from "../engine/util"
import {PropsBase, useWatchAllProps} from "../model/base"
import {Tool, ToolEvent, ToolOverlayInfo} from "./tool"

type SelectionToolSettingsType = {}

export class SelectionTool extends PropsBase<SelectionToolSettingsType> implements Tool {
    name: string
    private down: boolean
    private selection: Bounds

    constructor() {
        super({}, {})
        this.name = 'selection'
        this.down = false
        this.selection = new Bounds(-1, -1, 0, 0)
    }


    drawOverlay(ovr: ToolOverlayInfo): void {
        const bounds = this.selection.scale(ovr.scale)
        ovr.ctx.setLineDash([5,5])
        strokeBounds(ovr.ctx, bounds, 'black', 1)
        ovr.ctx.setLineDash([])
    }

    onMouseDown(evt: ToolEvent): void {
        if (!evt.layer) return
        this.down = true
        this.selection.x = evt.pt.floor().x
        this.selection.y = evt.pt.floor().y
        evt.markDirty()
    }

    onMouseMove(evt: ToolEvent): void {
        if (!evt.layer) return
        if(!this.down) return
        const pt = evt.pt.floor()
        this.selection = new Bounds(this.selection.x, this.selection.y,
            pt.x - this.selection.x,
            pt.y - this.selection.y)
        evt.markDirty()
    }

    onMouseUp(evt: ToolEvent): void {
        if (!evt.layer) return
        this.down = false
        const pt = evt.pt.floor()
        this.selection = new Bounds(this.selection.x, this.selection.y,
            pt.x - this.selection.x,
            pt.y - this.selection.y)
        evt.markDirty()
        console.log("selection is",this.selection)
    }
}


export function SelectionToolSettings(props: { tool: SelectionTool }) {
    useWatchAllProps(props.tool)
    return <div>
    </div>
}
