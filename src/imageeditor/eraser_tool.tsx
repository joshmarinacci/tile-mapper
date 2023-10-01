import React from "react"

import {PropsBase, useWatchAllProps} from "../model/base"
import {IntegerDef} from "../model/datamodel"
import {Tool, ToolEvent, ToolOverlayInfo} from "./tool"

type EraserSettingsType = {
    tip_size: number
}

export class EraserTool extends PropsBase<EraserSettingsType> implements Tool {
    name: string
    private _down: boolean

    constructor() {
        super({
            tip_size: IntegerDef,
        }, {
            tip_size: 3,
        })
        this.name = 'eraser'
        this._down = false
    }

    drawOverlay(ovr: ToolOverlayInfo): void {
    }

    onMouseDown(evt: ToolEvent): void {
        this._down = true
        if (evt.layer) {
            evt.layer.setPixel(evt.pt, -1)
        }
    }

    onMouseMove(evt: ToolEvent): void {
        if (evt.layer && this._down) {
            evt.layer.setPixel(evt.pt, -1)
        }
    }

    onMouseUp(evt: ToolEvent): void {
        this._down = false
    }

}

export function EraserToolSettings(props: { tool: EraserTool }) {
    useWatchAllProps(props.tool)
    return <div>
        <input type={"number"} value={props.tool.getPropValue('tip_size')} onChange={(e) => {
            const v = parseInt(e.target.value)
            console.log("new width is", v)
            props.tool.setPropValue('tip_size', v)
        }}/>
    </div>
}
