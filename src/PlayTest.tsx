import {Bounds, Point, Size} from "josh_js_util"
import React, {useEffect, useRef, useState} from "react"

import {MapImpl, TestImpl} from "./defs"
import {
    drawEditableSprite,
    EditableDocument,
} from "./model"

export type Player = {
    bounds: Bounds
    velocity: Point,
    standing: boolean,
    scroll: Point,
}

export class Animator {
    private cb: () => void
    private runnning: boolean
    private count: number

    constructor(cb: () => void) {
        this.cb = cb
        this.runnning = false
        this.count = 0
    }

    render() {
        this.count += 1
        if(this.count % 1 === 0) this.cb()
        if (this.runnning) requestAnimationFrame(() => this.render())
    }

    stop() {
        this.runnning = false
    }

    start() {
        this.runnning = true
        requestAnimationFrame(() => this.render())
    }
}

export type KeyState = {
    pressed: boolean,
    justPressed: boolean,
}

export class KeyManager {
    keys: Map<string, KeyState>

    constructor() {
        this.keys = new Map()
    }

    down(e: React.KeyboardEvent<HTMLCanvasElement>) {
        if (e.repeat) return
        const state = this.getKeyState(e.code)
        state.pressed = true
        state.justPressed = true
    }

    up(e: React.KeyboardEvent<HTMLCanvasElement>) {
        const state = this.getKeyState(e.code)
        state.pressed = false
        state.justPressed = false
    }

    isPressed(str: string) {
        return this.getKeyState(str).pressed
    }

    justPressed(name: string) {
        return this.getKeyState(name).justPressed
    }

    private getKeyState(str: string) {
        if (!this.keys.has(str)) {
            this.keys.set(str, {pressed: false, justPressed: false})
        }
        return (this.keys.get(str) as KeyState)
    }

    update() {
        this.keys.forEach((k) => {
            k.justPressed = false
        })
    }
}

const keyManager = new KeyManager()

const JUMP = new Point(0, -5.5)
const GRAVITY = new Point(0, 0.2)
const MOVE = new Point(0.1, 0)
const MAX_FALL_SPEED = 3.0
const FRICTION = 0.9
const EPSILON = 0.01


export function updatePlayer(doc: EditableDocument, map: MapImpl, player: Player, keys: KeyManager, canvas: HTMLCanvasElement, TS: Size, SCALE:number) {
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
    let debug_y = 200
    function debugText(text:string) {
        ctx.fillStyle = 'black'
        ctx.fillText(text,canvas.width-200,debug_y)
        debug_y += 20
    }
    function cell_index_to_game_bounds(pt: Point) {
        return new Bounds(
            pt.x * TS.w,
            pt.y * TS.h,
            TS.w,
            TS.h)
    }

    if (keys.justPressed('Space') && player.standing) {
        player.velocity = player.velocity.add(JUMP)
        player.standing = false
    }
    if (keys.isPressed('ArrowRight')) {
        player.velocity = player.velocity.add(MOVE)
    }
    if (keys.isPressed('ArrowLeft')) {
        player.velocity = player.velocity.add(MOVE.scale(-1))
    }

    function outlineCell(index:Point) {
        ctx.strokeStyle = '#a6f110'
        ctx.lineWidth = 2
        const bds = new Bounds(
            index.x*SCALE*TS.w + player.scroll.x*SCALE,
            index.y*SCALE*TS.h + player.scroll.y*SCALE,
            TS.w*SCALE,TS.h*SCALE
        )
        ctx.strokeRect(Math.floor(bds.x),Math.floor(bds.y),bds.w,bds.h)
    }

    //add gravity
    if(!player.standing) {
        player.velocity = player.velocity.add(GRAVITY)
    }
    if(player.velocity.y > MAX_FALL_SPEED) {
        player.velocity.y = MAX_FALL_SPEED
    }

    function check_tile(point: Point):{blocking:boolean, index:Point} {
        // debugPoint(point)
        const index = point.scale(1/TS.w).floor()
        // debugText(`cell: ${index.toString()}`)
        const cell = map.cells.get(index)
        if(cell) {
            const tile = doc.lookup_sprite(cell.tile)
            if (tile) {
                // debugText(`tile ${tile.getName()}`)
                const blocking = tile.getPropValue('blocking')
                // debugText(`blocking ${blocking}`)
                if (blocking) {
                    return ({blocking:true, index:index})
                }
            }
        }
        return ({blocking:false, index:index})
    }

    function handle_horizontal() {
        if(player.velocity.x > 0) {
            // debugText('right')
            player.velocity.x *= FRICTION
            if(player.velocity.x < EPSILON) {
                player.velocity.x = 0
            }
            const new_bounds = player.bounds.add(player.velocity)
            {
                const {blocking, index} = check_tile(new_bounds.top_right())
                outlineCell(index)
                if (blocking) {
                    console.log("h hit top right")
                    player.velocity.x = 0
                    const cell_bounds = cell_index_to_game_bounds(index)
                    player.bounds.x = cell_bounds.left() - TS.w
                    return
                }
            }
            {
                const {blocking, index} = check_tile(new_bounds.bottom_right().add(new Point(0,-1)))
                outlineCell(index)
                if (blocking) {
                    console.log("h hit bottom right")
                    player.velocity.x = 0
                    const cell_bounds = cell_index_to_game_bounds(index)
                    player.bounds.x = cell_bounds.left() - TS.w
                    return
                }
            }
        }
        if(player.velocity.x < 0) {
            // debugText('left')
            player.velocity.x *= FRICTION
            if(player.velocity.x > -EPSILON && player.velocity.x < 0) player.velocity.x = 0
            const new_bounds = player.bounds.add(player.velocity)
            {
                const {blocking, index} = check_tile(new_bounds.top_left())
                outlineCell(index)
                if (blocking) {
                    console.log("h hit top left")
                    player.velocity.x = 0
                    player.bounds.x = cell_index_to_game_bounds(index).right()
                    console.log("now vel",player.velocity)
                    return
                }
            }
            {
                const {blocking, index} = check_tile(new_bounds.bottom_left().add(new Point(0,-1)))
                outlineCell(index)
                if (blocking) {
                    console.log("h hit bottom left")
                    player.velocity.x = 0
                    player.bounds.x = cell_index_to_game_bounds(index).right()
                    console.log("now vel",player.velocity)
                }
            }
        }
    }
    function handle_vertical() {
        if(player.velocity.y > 0) {
            debugText('down')
            const new_bounds = player.bounds.add(player.velocity)
            {
                const {blocking, index} = check_tile(new_bounds.bottom_left())
                outlineCell(index)
                if(blocking) {
                    // stop downward velocity
                    console.log("v hit bottom left")
                    player.velocity.y = 0
                    // set pos.y to the grid boundary
                    const cell_bounds = cell_index_to_game_bounds(index)
                    player.bounds.y = cell_bounds.top() - TS.h
                    player.standing = true
                }
            }
            {
                const {blocking, index} = check_tile(new_bounds.bottom_right().add(new Point(-1,0)))
                outlineCell(index)
                if(blocking) {
                    console.log("v hit bottom right")
                    // stop downward velocity
                    player.velocity.y = 0
                    // set pos.y to the grid boundary
                    const cell_bounds = cell_index_to_game_bounds(index)
                    player.bounds.y = cell_bounds.top() - TS.h
                    player.standing = true
                }
            }
        }
        if(player.velocity.y < 0) {
            debugText('up')
            const new_bounds = player.bounds.add(player.velocity)
            {
                const {blocking, index} = check_tile(new_bounds.top_left())
                outlineCell(index)
                if(blocking) {
                    //stop vertical velocity
                    console.log("v hit top left")
                    player.velocity.y = 0
                    const cell_bounds = cell_index_to_game_bounds(index)
                    player.bounds.y = cell_bounds.bottom()
                    player.standing = false
                }
            }
            {
                const {blocking, index} = check_tile(new_bounds.top_right().add(new Point(-1,0)))
                outlineCell(index)
                if(blocking) {
                    console.log("v hit top right")
                    //stop vertical velocity
                    player.velocity.y = 0
                    const cell_bounds = cell_index_to_game_bounds(index)
                    player.bounds.y = cell_bounds.bottom()
                    player.standing = false
                }
            }
        }
    }
    handle_vertical()
    handle_horizontal()
    player.bounds = player.bounds.add(player.velocity)
}
export function drawViewport(current: HTMLCanvasElement, map: MapImpl, doc: EditableDocument, player: Player, keys: KeyManager, TS: Size,
                             SCALE:number
                             ) {
    const ctx = current.getContext('2d') as CanvasRenderingContext2D
    ctx.imageSmoothingEnabled = false
    ctx.fillStyle = '#f0f0f0'
    ctx.fillRect(0, 0, current.width, current.height)
    map.cells.forEach((v, n) => {
        const pos = n.scale(TS.w).scale(SCALE)
        const tile = doc.lookup_sprite(v.tile)
        if (tile) {
            if (tile.cache_canvas) {
                ctx.drawImage(tile.cache_canvas,
                    //src
                    0, 0, tile.cache_canvas.width, tile.cache_canvas.height,
                    //dst
                    Math.floor(pos.x + player.scroll.x*SCALE),
                    Math.floor(pos.y + player.scroll.y*SCALE),
                    TS.w * SCALE, TS.h * SCALE
                )
            } else {
                drawEditableSprite(ctx, SCALE, tile)
            }
        }
    })
    ctx.font = '12pt sans-serif'

    ctx.fillStyle = 'magenta'
    const rect = player.bounds.scale(SCALE)
    ctx.fillRect(rect.x+player.scroll.x*SCALE, rect.y+player.scroll.y*SCALE, rect.w, rect.h)
    ctx.fillStyle = 'black'
    const debugs = [
        `space=${keys.isPressed('Space')}`,
        `left=${keys.isPressed('ArrowLeft')}`,
        `right=${keys.isPressed('ArrowRight')}`,
        `standing=${player.standing}`,
        `pos = ${player.bounds.position().toString()}`,
        `vel = ${player.velocity.toString()}`,
    ]
    debugs.forEach((line,i) => ctx.fillText(line, current.width-200, 20+i*20))
}


let anim:Animator|null = null
export function PlayTest(props:{playing:boolean, doc:EditableDocument, map:MapImpl, test:TestImpl,
    zoom:number,
    grid:boolean,
}) {
    const {doc, map, test, zoom, grid} = props
    const ref = useRef(null)
    const sprite = doc.getSheets()[0].getImages()[0]
    const tileSize = new Size(sprite.width(), sprite.height())
    const [count, setCount] = useState(0)
    useEffect(() => {
        const hand = () => setCount(count + 1)
        test.onAny(hand)
        return () => test.offAny(hand)
    })

    function drawGrid(current:HTMLCanvasElement, zoom:number, TS:Size) {
        const ctx = current.getContext('2d') as CanvasRenderingContext2D
        ctx.strokeStyle = 'red'
        ctx.lineWidth = 1
        ctx.save()
        ctx.beginPath()
        const size = map.getPropValue('size') as Size
        for(let i=0; i<size.w; i++) {
            ctx.moveTo(i*zoom*TS.w,0)
            ctx.lineTo(i*zoom*TS.w,size.h*zoom*TS.h)
        }
        for(let i=0; i<size.h; i++) {
            ctx.moveTo(0,i*zoom*TS.h)
            ctx.lineTo(size.w*zoom*TS.h,i*zoom*TS.w)
        }
        ctx.stroke()
        ctx.restore()
    }

    useEffect(() => {
        if (ref.current) {
            const canvas = ref.current as HTMLCanvasElement
            const player: Player = {
                bounds: new Bounds(30, 30, tileSize.w, tileSize.h),
                velocity: new Point(0, 0),
                standing: false,
                scroll: new Point(0,0),
            }
            if (props.playing) {
                canvas.focus()
                anim = new Animator(() => {
                    player.scroll.x = -player.bounds.x + 100
                    drawViewport(canvas, map, doc, player, keyManager, tileSize, zoom)
                    updatePlayer(doc, map, player, keyManager, canvas, tileSize, zoom)
                    if(grid) drawGrid(canvas,zoom,tileSize)
                    keyManager.update()
                })
                anim.start()
            } else {
                if(anim) anim.stop()
                drawViewport(canvas, map, doc, player, keyManager, tileSize, zoom)
                if(grid) drawGrid(canvas,zoom,tileSize)
            }
        }
    }, [props.playing, test.getPropValue('viewport'), zoom, grid])
    const viewport = test.getPropValue('viewport') as Size
    return <canvas ref={ref}
                   width={viewport.w*tileSize.w*zoom}
                   height={viewport.h*tileSize.h*zoom}
                   autoFocus={true}
                   className={'play-canvas'}
                   tabIndex={0}
                   style={{
                       alignSelf:'start'
                   }}
                   onKeyDown={(e)=> keyManager.down(e)}
                   onKeyUp={(e) => keyManager.up(e)}
    ></canvas>
}
