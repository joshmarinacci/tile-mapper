import {Bounds, Point} from "josh_js_util"

import {ActorsLayer} from "./actorslayer"
import {TileCache} from "./cache"
import {
    Actor,
    Enemy,
    EPISLON,
    Item,
    Layer,
    Player,
} from "./globals"
import {KeyboardManager, KeyCodes} from "./keyboard"
import {TilemapLayer} from "./tilemaplayer"
import {strokeBounds} from "./util"

type Collision = {
    hit: boolean
    target? : Actor
}
export type PhysicsConstants = {
    gravity:number,
    jump_power: number
    move_speed: number,
    move_speed_max: number,
    friction: number,
}
const l = (...args: unknown[]) => console.log(...args)

export class PhysicsManager implements Layer {
    blocking: boolean
    name: string
    type: "tilemap" | "actors" | "overlay"
    private highlights: Point[]

    constructor() {
        this.blocking = false
        this.name = 'physics'
        this.type = 'overlay'
        this.highlights = []
    }

    collide(ply: Player, layer: Layer, cache: TileCache): Collision {
        // console.log(`looking at layer. name=${layer.name}  type=${layer.type}  blocking=${layer.blocking}`)
        if (!layer.blocking) return {
            hit: false
        }
        if (layer.type === 'actors') {
            return this.collideActorsLayer(ply, layer as ActorsLayer, cache)
        }
        if(layer.type === 'tilemap') {
            return this.collideTilemapLayer(ply, layer as TilemapLayer, cache)
        }
        return {
            hit: false
        }
    }
    collideTilemapLayer(ply:Player, layer:TilemapLayer, cache:TileCache) {
        const tileWidth = cache.getTileSize().w
        const tiles = layer as TilemapLayer
        const isBlocking = (index: Point) => {
            const cell = tiles.tiles.get(index)
            if (cell) {
                const tile = cache.getTileByUUID(cell)
                if (tile) {
                    if (tile.blocking) {
                        return true
                    }
                }
            }
            return false
        }

        // handle horizontal first
        //if standing and moving left
        const new_bounds = ply.bounds.copy()
        new_bounds.x += ply.vx
        // moving left
        if (ply.vx < 0) {
            const tx = new_bounds.left()
            const indexes: Point[] = []
            for (let y = new_bounds.top(); y < new_bounds.bottom(); y += tileWidth) {
                const index = new Point(tx, y).scale(1 / tileWidth).floor()
                indexes.push(index)
                this.highlights.push(index)
            }
            for (const index of indexes) {
                if (isBlocking(index)) {
                    ply.vx = 0
                    new_bounds.x = (index.x + 1) * tileWidth
                }
            }
        }
        // moving right
        if (ply.vx > 0) {
            const tx = new_bounds.right()
            const indexes: Point[] = []
            for (let y = new_bounds.top(); y < new_bounds.bottom(); y += tileWidth) {
                const index = new Point(tx, y).scale(1 / tileWidth).floor()
                indexes.push(index)
                this.highlights.push(index)
            }
            for (const index of indexes) {
                if (isBlocking(index)) {
                    ply.vx = 0
                    new_bounds.x = (index.x * tileWidth) - new_bounds.w
                }
            }
        }

        // final update for horizontal
        ply.bounds.x = new_bounds.x

        // now handle vertical
        new_bounds.y += ply.vy
        // going up
        if (ply.vy < 0) {
            const ty = new_bounds.top()
            const indexes: Point[] = []
            for (let x = new_bounds.left(); x < new_bounds.right(); x += tileWidth) {
                const index = new Point(x, ty).scale(1 / tileWidth).floor()
                indexes.push(index)
            }
            const index_extra = new Point(new_bounds.right()-1,ty).scale(1/tileWidth).floor()
            indexes.push(index_extra)
            for (const index of indexes) {
                this.highlights.push(index)
                if (isBlocking(index)) {
                    ply.vy = 0
                    ply.standing = false
                    new_bounds.y = (index.y+1) * tileWidth
                }
            }
        }
        // going down
        if (ply.vy > 0) {
            const ty = new_bounds.bottom()
            const indexes: Point[] = []
            for (let x = new_bounds.left(); x < new_bounds.right(); x += tileWidth) {
                const index = new Point(x, ty).scale(1 / tileWidth).floor()
                indexes.push(index)
            }
            const index_extra = new Point(new_bounds.right()-1,ty).scale(1/tileWidth).floor()
            indexes.push(index_extra)

            for (const index of indexes) {
                this.highlights.push(index)
                if (isBlocking(index)) {
                    ply.vy = 0
                    ply.standing = true
                    new_bounds.y = (index.y) * tileWidth - new_bounds.h
                }
            }
        }

        ply.bounds.y = new_bounds.y
        return {
            hit: false
        }
    }

    updatePlayer(players: Player[], layers: Layer[], keyboard: KeyboardManager, cache: TileCache, values:PhysicsConstants) {
        players.forEach(ply => {
            // apply gravity
            ply.vy += values.gravity

            // run right
            if (keyboard.isPressed(KeyCodes.ArrowRight)) {
                ply.vx += values.move_speed
            }
            // run left
            if (keyboard.isPressed(KeyCodes.ArrowLeft)) {
                ply.vx -= values.move_speed
            }
            // apply friction when standing
            if (ply.standing) ply.vx *= values.friction
            // limit to max speeds
            if (ply.vx > values.move_speed_max) ply.vx = values.move_speed_max
            if (ply.vx < - values.move_speed_max) ply.vx = -values.move_speed_max
            // round to zero
            if (Math.abs(ply.vx) < EPISLON) ply.vx = 0

            // jump
            if (keyboard.isPressed(KeyCodes.Space) && ply.standing) {
                ply.vy += values.jump_power
                ply.standing = false
            }
            layers.forEach(layer => {
                const col = this.collide(ply, layer, cache)
                if(col.hit) {
                    // l("hit something",col)
                    if(col.target && col.target?.type === 'item') {
                        const item = col.target as Item
                        if(item.name === 'health'){
                            l("got some health")
                            item.hidden = true
                        }
                    }
                    if(col.target && col.target.type === 'enemy' && ply.hitable) {
                        // const enemy = col.target as Enemy
                        l("hit a badguy. loose some health")
                        ply.hitable = false
                        setTimeout(() =>{ ply.hitable = true},1000)
                    }
                }
            })
        })
    }


    drawSelf(ctx: CanvasRenderingContext2D, viewport: Bounds, cache: TileCache, scale:number): void {
        const tileWidth = cache.getTileSize().w
        ctx.save()
        ctx.translate(-viewport.x,-viewport.y)
        this.highlights.forEach(cell => {
            strokeBounds(ctx, new Bounds(cell.x, cell.y, 1, 1).scale(tileWidth).scale(scale), 'yellow', 5)
        })
        this.highlights = []
        ctx.restore()
    }

    private collideActorsLayer(ply: Player, layer1: ActorsLayer, cache: TileCache):Collision {
        for(const act of layer1.actors) {
            if(act === ply) continue
            if(act.hidden) continue
            if(act.bounds.intersects(ply.bounds)) {
                return {
                    hit:true,
                    target:act,
                }
            }
        }
        return {
            hit: false
        }
    }

    updateEnemies(enemies: Enemy[], layers: Layer[], cache: TileCache) {
        const tileWidth = cache.getTileSize().w
        for(const layer of layers) {
            if(layer.type === 'tilemap' && layer.blocking) {
                const tiles = layer as TilemapLayer
                const isBlocking = (index: Point) => {
                    const cell = tiles.tiles.get(index)
                    if (cell) {
                        const tile = cache.getTileByUUID(cell)
                        if (tile) {
                            if (tile.blocking) {
                                return true
                            }
                        }
                    }
                    return false
                }
                enemies.forEach(en => {
                    const new_bounds = en.bounds.copy()
                    new_bounds.x += en.vx
                    if(en.vx > 0) {
                        const next = en.bounds.top_right().scale(1 / tileWidth).floor()
                        if (isBlocking(next)) {
                            en.vx *= -1
                            new_bounds.x = en.bounds.x
                            en.bounds = new_bounds
                            return
                        }
                    }
                    if(en.vx < 0) {
                        const next = en.bounds.top_left().scale(1 / tileWidth).floor()
                        if (isBlocking(next)) {
                            en.vx *= -1
                            new_bounds.x = en.bounds.x
                            en.bounds = new_bounds
                            return
                        }
                    }
                    en.bounds = new_bounds
                })
            }
        }
    }

    private log(...args: unknown []) {
        console.log("Physics",...args)
    }
}
