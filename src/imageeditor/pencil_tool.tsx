import {Point} from "josh_js_util"
import React from "react"

import {PropsBase, useWatchAllProps} from "../model/base"
import {IntegerDef} from "../model/datamodel"
import {Tool, ToolEvent, ToolOverlayInfo} from "./tool"

type PencilSettingsType = {
    tip_size: number
}

export class PencilTool extends PropsBase<PencilSettingsType> implements Tool {
    name: string
    private _down: boolean
    private _cursor: Point

    constructor() {
        super({
            tip_size: IntegerDef
        }, {
            tip_size: 3,
        })
        this.name = 'pencil'
        this._down = false
        this._cursor = new Point(-1, -1)
    }

    drawOverlay(ovr: ToolOverlayInfo): void {
        ovr.ctx.fillStyle = 'red'
        const size = this.getPropValue('tip_size')
        ovr.ctx.fillRect(this._cursor.x * ovr.scale, this._cursor.y * ovr.scale, size * ovr.scale, size * ovr.scale)
    }

    onMouseDown(evt: ToolEvent): void {
        this._down = true
        this._cursor = evt.pt
        if (evt.layer) {
            evt.layer.setPixel(evt.pt, evt.color)
        }
    }

    onMouseMove(evt: ToolEvent): void {
        this._cursor = evt.pt
        evt.markDirty()
        if (evt.layer && this._down) {
            evt.layer.setPixel(evt.pt, evt.color)
        }
    }

    onMouseUp(evt: ToolEvent): void {
        this._cursor = evt.pt
        this._down = false
    }

}

export function PencilToolSettings(props: { tool: PencilTool }) {
    useWatchAllProps(props.tool)
    return <div>
        <input type={"number"} value={props.tool.getPropValue('tip_size')} onChange={(e) => {
            const v = parseInt(e.target.value)
            console.log("new width is", v)
            props.tool.setPropValue('tip_size', v)
        }}/>
    </div>
}
