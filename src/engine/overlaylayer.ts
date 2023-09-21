import {Bounds} from "josh_js_util"

import {Layer} from "./globals"
import {strokeBounds} from "./util"

export class OverlayLayer implements Layer {
    blocking: boolean
    name: string
    type: 'overlay'

    constructor() {
        this.blocking = false
        this.name = 'overlay name'
        this.type = 'overlay'
    }

    drawSelf(ctx: CanvasRenderingContext2D, viewport: Bounds): void {
        ctx.save()
        ctx.translate(-viewport.x, -viewport.y)
        ctx.fillStyle = 'yellow'
        ctx.font = '12pt sans-serif'
        ctx.fillText('overlay text', 20, 100)
        const vp = new Bounds(viewport.x + 200, viewport.y + 200, viewport.w - 400, viewport.h - 400)
        strokeBounds(ctx, vp, 'green', 5)
        ctx.restore()
    }
}
