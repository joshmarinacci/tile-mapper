import {Actor, Layer, Player, SCALE} from "./globals";
import {Bounds} from "josh_js_util";
import {TileCache} from "./cache";
import {fillBounds} from "./util";

export class ActorsLayer implements Layer {
    blocking: boolean
    name: string
    type: "actors"
    actors: Actor[]

    constructor() {
        this.blocking = false
        this.name = 'actors'
        this.type = 'actors'
        this.actors = []
    }

    drawSelf(ctx: CanvasRenderingContext2D, viewport: Bounds, cache: TileCache): void {
        ctx.save()
        ctx.imageSmoothingEnabled = false
        ctx.translate(-viewport.x,0)
        this.actors.forEach(actor => {
            if(actor.hidden) return
            const cached = cache.getTileByName(actor.tile)
            if (cached) {
                ctx.drawImage(cached.canvas,
                    Math.floor(actor.bounds.x*SCALE),
                    Math.floor(actor.bounds.y*SCALE),
                    actor.bounds.w*SCALE,
                    actor.bounds.h*SCALE)
            } else {
                fillBounds(ctx, actor.bounds, actor.color)
            }
        })
        ctx.restore()
    }

    addActor(player: Actor) {
        this.actors.push(player)
    }
}
