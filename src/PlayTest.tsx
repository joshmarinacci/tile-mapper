import {ArrayGrid, Size} from "josh_js_util"
import React, {useEffect, useRef} from "react"

import {Doc2, Map2, Test2, TileLayer2} from "./data2"
import {MapCell} from "./defs"
import {TileCache} from "./engine/cache"
import {GameState} from "./engine/gamestate"
import {TileReference} from "./engine/globals"
import {TilemapLayer} from "./engine/tilemaplayer"

function generateGamestate(current: HTMLCanvasElement, doc: Doc2, map: Map2, size:Size) {
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
        if (layer instanceof TileLayer2) {
            const tl = new TilemapLayer()
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

    return {game_state: gamestate, cache}
}

function drawGrid(current: HTMLCanvasElement, zoom: number, tileSize: Size, biggest:Size) {
    const ctx = current.getContext('2d') as CanvasRenderingContext2D
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 1
    ctx.save()
    ctx.beginPath()
    const size = biggest
    for (let i = 0; i < size.w; i++) {
        ctx.moveTo(i * zoom * tileSize.w, 0)
        ctx.lineTo(i * zoom * tileSize.w, size.h * zoom * tileSize.h)
    }
    for (let i = 0; i < size.h; i++) {
        ctx.moveTo(0, i * zoom * tileSize.h)
        ctx.lineTo(size.w * zoom * tileSize.h, i * zoom * tileSize.w)
    }
    ctx.stroke()
    ctx.restore()
}

export function PlayTest(props: {
    playing: boolean,
    doc: Doc2,
    map: Map2,
    test: Test2,
    zoom: number,
    grid: boolean,
}) {
    const {doc, map, test, zoom, grid} = props
    const tileSize = doc.getPropValue('tileSize')
    const biggest = map.calcBiggestLayer()
    const viewport = test.getPropValue('viewport') as Size
    const ref = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        if (!ref.current) return
        const {game_state, cache} = generateGamestate(ref.current, doc, map, viewport.scale(zoom).scale(tileSize.w))
        const ctx = game_state.getDrawingSurface()
        const vp = game_state.getViewport()
        ctx.fillStyle = 'red'
        ctx.fillRect(0, 0, 300, 300)
        game_state.getCurrentMap().layers.forEach(layer => layer.drawSelf(ctx, vp, cache, zoom))
        if (grid) {
            drawGrid(ref.current, zoom, tileSize, biggest)
        }
    }, [doc, test, zoom, grid])
    return <div>
        <canvas ref={ref}
                width={viewport.w * tileSize.w * zoom}
                height={viewport.h * tileSize.h * zoom}></canvas>
    </div>
}
