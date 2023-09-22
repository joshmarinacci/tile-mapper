import {ArrayGrid, Bounds, Point, Size} from "josh_js_util"

import {TileCache} from "./cache"
import {Layer, TileReference} from "./globals"

function wrapPoint(pt: Point, size: Size) {
    pt = pt.copy()
    if (pt.x < 0) {
        pt.x = 0
    }
    if (pt.x >= size.w) {
        pt.x = pt.x % size.w
    }
    if (pt.y < 0) pt.y = 0
    if (pt.y > size.h - 1) {
        pt.y = pt.y % size.h
    }
    return pt
}

export class TilemapLayer implements Layer {
    tiles: ArrayGrid<TileReference>
    name: string
    type: "tilemap"
    blocking: boolean
    wrapping: boolean
    scrollSpeed: number

    constructor() {
        this.tiles = new ArrayGrid<TileReference>(0, 0)
        this.name = 'unnamed tilemap layer'
        this.type = 'tilemap'
        this.blocking = false
        this.wrapping = true
        this.scrollSpeed = 1
    }


    drawSelf(ctx: CanvasRenderingContext2D, viewport: Bounds, cache:TileCache, SCALE:number): void {
        const TILE_SIZE = cache.getTileSize().w
        // this.log('drawing self')
        // this.log("viewport is", viewport)
        ctx.save()
        ctx.imageSmoothingEnabled = false
        const w = Math.ceil(viewport.w / SCALE / TILE_SIZE) + 1
        const h = Math.ceil(viewport.h / SCALE / TILE_SIZE) + 1
        const xoff = viewport.x / SCALE / TILE_SIZE * this.scrollSpeed
        const yoff = viewport.y / SCALE / TILE_SIZE * this.scrollSpeed
        // this.log(`drawing ${w} x ${h} cells`)
        for (let j = 0; j < h; j++) {
            for (let i = 0; i < w; i++) {
                let tb = new Bounds(i, j, 1, 1).scale(TILE_SIZE)
                tb = tb.add(new Point(
                    (-xoff * TILE_SIZE % TILE_SIZE),
                    (-yoff * TILE_SIZE % TILE_SIZE)))

                let nn = new Point(i + xoff, j + yoff).floor()
                if (this.wrapping) {
                    nn = wrapPoint(nn, new Size(this.tiles.w, this.tiles.h))
                }
                if (this.isValidIndex(nn)) {
                    const tile = this.tiles.get(nn)
                    const cached = cache.getTileByName(tile)
                    if (cached) {
                        ctx.drawImage(cached.canvas,
                            Math.floor(tb.x*SCALE),
                            Math.floor(tb.y*SCALE),
                            tb.w*SCALE,
                            tb.h*SCALE)
                    } else {
                        // fillBounds(ctx, tb, 'magenta')
                    }
                }
                // strokeBounds(ctx,tb,'gray',0.5)
                // const str = `${nn.x}, ${nn.y}`
                // debugDrawText(ctx,str,tb.position().add(new Point(1,0)))
            }
        }
        ctx.restore()
        // strokeBounds(ctx, new Bounds(0, 0, viewport.w, viewport.h), 'red', 1.0)
    }

    loadFromString(size: Size, string: string, mapping: Record<string, string>) {
        this.tiles = new ArrayGrid<TileReference>(size.w, size.h)
        const lines = string.trim().split('\n')
        lines.forEach((line, j) => {
            // l(line.trim(),j)
            line = line.trim().replaceAll(' ', '')
            for (const [i, ch] of Array.from(line).entries()) {
                // l(i,ch)
                if (mapping[ch]) {
                    const v = mapping[ch]
                    this.tiles.set_at(i, j, {uuid: v})
                }
            }
        })
    }

    private isValidIndex(nn: Point) {
        if (nn.x < 0) return false
        if (nn.y < 0) return false
        if (nn.x >= this.tiles.w) return false
        if (nn.y >= this.tiles.h) return false
        return true
    }

    private log(...any:unknown[]) {
        console.log(this.constructor.name,...any)
    }
}
