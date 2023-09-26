import {ArrayGrid, Size} from "josh_js_util"
import React, {useEffect, useRef, useState} from "react"

import {ActorsLayer} from "../engine/actorslayer"
import {TileCache} from "../engine/cache"
import {GameState} from "../engine/gamestate"
import {TileReference} from "../engine/globals"
import {PhysicsConstants} from "../engine/physics"
import {TilemapLayer} from "../engine/tilemaplayer"
import {useWatchAllProps} from "../model/base"
import {GameDoc, GameMap, GameTest, MapCell,TileLayer} from "../model/datamodel"

function generateGamestate(current: HTMLCanvasElement, doc: GameDoc, map: GameMap, size:Size, physicsDebug:boolean) {
    const gamestate = new GameState(current, size)
    const cache = new TileCache(doc.getPropValue('tileSize'))
    // pre-cache all of the tiles
    doc.getPropValue('sheets').forEach(sht => {
        sht.getPropValue('tiles').forEach(tile => {
            tile.rebuild_cache()
            if (tile.cache_canvas) {
                cache.addCachedTile(tile.getPropValue('name'), tile._id, {
                    name: tile.getPropValue('name'),
                    id: tile._id,
                    blocking: tile.getPropValue('blocking'),
                    canvas: tile.cache_canvas
                })
            }
        })
    })
    // turn each layer of the map into a layer of the engine
    map.getPropValue('layers').forEach(layer => {
        if (layer instanceof TileLayer) {
            const tl = new TilemapLayer()
            tl.type = 'tilemap'
            tl.blocking = layer.getPropValue('blocking')
            tl.wrapping = layer.getPropValue('wrapping')
            tl.scrollSpeed = layer.getPropValue('scrollSpeed')
            const size = layer.getPropValue('size')
            tl.tiles = new ArrayGrid<TileReference>(size.w, size.h)
            const editorCells = layer.getPropValue('data') as ArrayGrid<MapCell>
            tl.tiles.fill((n) => {
                if (editorCells.get(n)) return ({ uuid: editorCells.get(n).tile })
                return ({ uuid: 'unknown' })
            })
            gamestate.addLayer(tl)
        }
    })
    const actors = new ActorsLayer()
    actors.blocking = true
    gamestate.addLayer(actors)
    if(physicsDebug) gamestate.addLayer(gamestate.getPhysics())
    gamestate.getPlayers().forEach(ply => actors.addActor(ply))
    return {game_state: gamestate, cache}
}

function drawGrid(current: HTMLCanvasElement, zoom: number, tileSize: Size, viewport:Size) {
    const ctx = current.getContext('2d') as CanvasRenderingContext2D
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 1
    ctx.save()
    ctx.beginPath()
    for (let i = 0; i < viewport.w; i++) {
        ctx.moveTo(i * zoom * tileSize.w, 0)
        ctx.lineTo(i * zoom * tileSize.w, viewport.h * zoom * tileSize.h)
    }
    for (let i = 0; i < viewport.h; i++) {
        ctx.moveTo(0, i * zoom * tileSize.h)
        ctx.lineTo(viewport.w * zoom * tileSize.h, i * zoom * tileSize.w)
    }
    ctx.stroke()
    ctx.restore()
}


class Anim {
    private cache: TileCache
    private game_state: GameState
    private zoom: number
    private callback: () => void
    private playing: boolean
    private physics: PhysicsConstants
    private target: HTMLCanvasElement
    private keydown_handler: (e: KeyboardEvent) => void
    private keyup_handler: (e: KeyboardEvent) => void
    constructor() {
        this.playing = false
        this.zoom = 1
        this.keydown_handler = (e:KeyboardEvent)  => {
            this.game_state.getKeyboard().keydown(e.code)
        }
        this.keyup_handler = (e:KeyboardEvent)  => {
            this.game_state.getKeyboard().keyup(e.code)
        }

        this.physics = {
            gravity:0,
            jump_power: 0,
            friction:0,
            move_speed_max: 0,
            move_speed: 0,
        }
        this.callback = () => {
            this.drawOnce()
            if(this.playing) requestAnimationFrame(this.callback)
        }
    }

    stop() {
        this.playing= false
        this.log("stopping")
    }

    play() {
        this.log("playing")
        this.playing = true
        requestAnimationFrame(this.callback)
    }

    private log(...args:unknown[]) {
        console.log('Anim',...args)
    }

    setGamestate(params: { cache: TileCache; game_state: GameState }) {
        this.cache = params.cache
        this.game_state = params.game_state
    }

    drawOnce() {
        const map = this.game_state.getCurrentMap()
        const ctx = this.game_state.getDrawingSurface()
        const vp = this.game_state.getViewport()
        // const vp = new Bounds(0,0,300,300)
        const players = this.game_state.getPlayers()
        this.game_state.getPhysics().updatePlayer(players, map.layers, this.game_state.getKeyboard(), this.cache, this.physics)
        this.game_state.getPhysics().updateEnemies(this.game_state.getEnemies(), map.layers, this.cache)
        this.game_state.updateViewport(vp, players, this.zoom)
        // this.log("drawing", players.length, map.layers.length, vp.left())
        ctx.fillStyle = 'black'
        ctx.save()
        map.layers.forEach(layer => layer.drawSelf(ctx, vp, this.cache, this.zoom))
        ctx.restore()
    }

    setZoom(zoom: number) {
        this.zoom = zoom
    }

    setPhysicsConstants(phs: PhysicsConstants) {
        this.physics = phs
    }

    setKeyboardTarget(target: HTMLCanvasElement) {
        if(this.target) {
            this.target.removeEventListener('keydown',this.keydown_handler)
            this.target.removeEventListener('keyup',this.keyup_handler)
        }
        this.target = target
        if(this.target) {
            this.target.addEventListener('keydown',this.keydown_handler)
            this.target.addEventListener('keyup',this.keyup_handler)
        }
    }
}

export function PlayTest(props: {
    playing: boolean,
    doc: GameDoc,
    map: GameMap,
    test: GameTest,
    zoom: number,
    grid: boolean,
    physicsDebug: boolean,
}) {
    const {doc, map, test, zoom, grid, playing} = props
    const tileSize = doc.getPropValue('tileSize')
    const viewport = test.getPropValue('viewport') as Size
    const ref = useRef<HTMLCanvasElement>(null)
    const [anim, setAnim] = useState(() => new Anim())

    const redraw = () => {
        if (!ref.current) return
        anim.setGamestate(generateGamestate(ref.current, doc, map, viewport.scale(zoom).scale(tileSize.w), props.physicsDebug))
        const phs:PhysicsConstants = {
            gravity: test.getPropValue('gravity'),
            jump_power: test.getPropValue('jump_power'),
            move_speed: test.getPropValue('move_speed'),
            move_speed_max: test.getPropValue('move_speed_max'),
            friction: test.getPropValue('friction')
        }
        anim.setPhysicsConstants(phs)
        anim.setKeyboardTarget(ref.current)
        anim.setZoom(zoom)
        anim.drawOnce()
        if (grid) {
            drawGrid(ref.current, zoom, tileSize, viewport)
        }
    }
    useWatchAllProps(test, () => redraw())
    useEffect(() => redraw(), [doc, test, zoom, grid, ref, viewport, props.physicsDebug])
    useEffect(() => {
        if(playing) {
            anim.stop()
            anim.play()
        } else {
            anim.stop()
        }
    }, [playing])
    return <div>
        <canvas ref={ref}
                tabIndex={0}

                width={viewport.w * tileSize.w * zoom}
                height={viewport.h * tileSize.h * zoom}></canvas>
    </div>
}
