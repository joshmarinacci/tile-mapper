import {
    Actor,
    Enemy,
    EPISLON,
    FRICTION,
    GRAVITY,
    Item,
    JUMP_POWER,
    Layer,
    MAX_MOVE,
    MOVE_SPEED,
    Player,
    SCALE,
    TILE_SIZE
} from "./globals";
import {Bounds, Point} from "josh_js_util";
import {TilemapLayer} from "./tilemaplayer";
import {KeyboardManager, KeyCodes} from "./keyboard";
import {strokeBounds} from "./util";
import {TileCache} from "./cache";
import {ActorsLayer} from "./actorslayer";

type Collision = {
    hit: boolean
    target? : Actor
}
const l = (...args: any) => console.log(...args)

export class PhysicsManager implements Layer {
    blocking: boolean;
    name: string;
    type: "tilemap" | "actors" | "overlay";
    private highlights: Point[];

    constructor() {
        this.blocking = false
        this.name = 'physics'
        this.type = 'overlay'
        this.highlights = []
    }

    collide(ply: Player, layer: Layer, cache: TileCache): Collision {
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
        let tiles = layer as TilemapLayer
        const isBlocking = (index: Point) => {
            let cell = tiles.tiles.get(index)
            if (cell) {
                let tile = cache.getTileByName(cell)
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
        let new_bounds = ply.bounds.copy()
        new_bounds.x += ply.vx
        // moving left
        if (ply.vx < 0) {
            let tx = new_bounds.left()
            let indexes: Point[] = []
            for (let y = new_bounds.top(); y < new_bounds.bottom(); y += TILE_SIZE) {
                let index = new Point(tx, y).scale(1 / TILE_SIZE).floor()
                indexes.push(index)
                this.highlights.push(index)
            }
            for (let index of indexes) {
                if (isBlocking(index)) {
                    ply.vx = 0
                    new_bounds.x = (index.x + 1) * TILE_SIZE
                }
            }
        }
        // moving right
        if (ply.vx > 0) {
            let tx = new_bounds.right()
            let indexes: Point[] = []
            for (let y = new_bounds.top(); y < new_bounds.bottom(); y += TILE_SIZE) {
                let index = new Point(tx, y).scale(1 / TILE_SIZE).floor()
                indexes.push(index)
                this.highlights.push(index)
            }
            for (let index of indexes) {
                if (isBlocking(index)) {
                    ply.vx = 0
                    new_bounds.x = (index.x * TILE_SIZE) - new_bounds.w
                }
            }
        }

        // final update for horizontal
        ply.bounds.x = new_bounds.x

        // now handle vertical
        new_bounds.y += ply.vy
        // going up
        if (ply.vy < 0) {
            let ty = new_bounds.top()
            let indexes: Point[] = []
            for (let x = new_bounds.left(); x < new_bounds.right(); x += TILE_SIZE) {
                let index = new Point(x, ty).scale(1 / TILE_SIZE).floor()
                indexes.push(index)
            }
            let index_extra = new Point(new_bounds.right()-1,ty).scale(1/TILE_SIZE).floor()
            indexes.push(index_extra)
            for (let index of indexes) {
                this.highlights.push(index)
                if (isBlocking(index)) {
                    ply.vy = 0
                    ply.standing = false
                    new_bounds.y = (index.y+1) * TILE_SIZE
                }
            }
        }
        // going down
        if (ply.vy > 0) {
            let ty = new_bounds.bottom()
            let indexes: Point[] = []
            for (let x = new_bounds.left(); x < new_bounds.right(); x += TILE_SIZE) {
                let index = new Point(x, ty).scale(1 / TILE_SIZE).floor()
                indexes.push(index)
            }
            let index_extra = new Point(new_bounds.right()-1,ty).scale(1/TILE_SIZE).floor()
            indexes.push(index_extra)

            for (let index of indexes) {
                this.highlights.push(index)
                if (isBlocking(index)) {
                    ply.vy = 0
                    ply.standing = true
                    new_bounds.y = (index.y) * TILE_SIZE - new_bounds.h
                }
            }
        }

        ply.bounds.y = new_bounds.y
        return {
            hit: false
        }
    }

    updatePlayer(players: Player[], layers: Layer[], keyboard: KeyboardManager, cache: TileCache) {
        players.forEach(ply => {
            // apply gravity
            ply.vy += GRAVITY

            // run right
            if (keyboard.isPressed(KeyCodes.ArrowRight)) {
                ply.vx += MOVE_SPEED
            }
            // run left
            if (keyboard.isPressed(KeyCodes.ArrowLeft)) {
                ply.vx -= MOVE_SPEED
            }
            // apply friction when standing
            if (ply.standing) ply.vx *= FRICTION
            // limit to max speeds
            if (ply.vx > MAX_MOVE) ply.vx = MAX_MOVE
            if (ply.vx < -MAX_MOVE) ply.vx = -MAX_MOVE
            // round to zero
            if (Math.abs(ply.vx) < EPISLON) ply.vx = 0

            // jump
            if (keyboard.isPressed(KeyCodes.Space) && ply.standing) {
                ply.vy += JUMP_POWER
                ply.standing = false
            }
            layers.forEach(layer => {
                let col = this.collide(ply, layer, cache)
                if(col.hit) {
                    // l("hit something",col)
                    if(col.target && col.target?.type === 'item') {
                        let item = col.target as Item
                        if(item.name === 'health'){
                            l("got some health")
                            item.hidden = true
                        }
                    }
                    if(col.target && col.target.type === 'enemy' && ply.hitable) {
                        let enemy = col.target as Enemy
                        l("hit a badguy. loose some health")
                        ply.hitable = false
                        setTimeout(() =>{ ply.hitable = true},1000)
                    }
                }
            })
        })
    }


    drawSelf(ctx: CanvasRenderingContext2D, viewport: Bounds, cache: TileCache): void {
        ctx.save()
        ctx.translate(-viewport.x,-viewport.y)
        this.highlights.forEach(cell => {
            strokeBounds(ctx, new Bounds(cell.x, cell.y, 1, 1).scale(TILE_SIZE).scale(SCALE), 'yellow', 5)
        })
        this.highlights = []
        ctx.restore()
    }

    private collideActorsLayer(ply: Player, layer1: ActorsLayer, cache: TileCache):Collision {
        for(let act of layer1.actors) {
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
        for(let layer of layers) {
            if(layer.type === 'tilemap' && layer.blocking) {
                let tiles = layer as TilemapLayer
                const isBlocking = (index: Point) => {
                    let cell = tiles.tiles.get(index)
                    if (cell) {
                        let tile = cache.getTileByName(cell)
                        if (tile) {
                            if (tile.blocking) {
                                return true
                            }
                        }
                    }
                    return false
                }
                enemies.forEach(en => {
                    let new_bounds = en.bounds.copy()
                    new_bounds.x += en.vx
                    if(en.vx > 0) {
                        let next = en.bounds.top_right().scale(1 / TILE_SIZE).floor()
                        if (isBlocking(next)) {
                            en.vx *= -1
                            new_bounds.x = en.bounds.x
                            en.bounds = new_bounds
                            return
                        }
                    }
                    if(en.vx < 0) {
                        let next = en.bounds.top_left().scale(1 / TILE_SIZE).floor()
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
}