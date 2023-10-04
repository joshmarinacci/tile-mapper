import {ArrayGrid, Size} from "josh_js_util"
import React, {useEffect, useRef, useState} from "react"

import {drawGrid} from "../actions/actions"
import {GameState} from "../engine/gamestate"
import {drawImage} from "../imageeditor/SImageEditorView"
import {findActorForInstance} from "../mapeditor/ActorEditor"
import {useWatchAllProps} from "../model/base"
import {ActorLayer, GameDoc, GameMap, GameTest, MapCell, TileLayer} from "../model/datamodel"
import {Anim} from "./Anim"

function generateGamestate(current: HTMLCanvasElement, doc: GameDoc, map: GameMap, size:Size, physicsDebug:boolean) {
    const gamestate = new GameState(current, size)
    const cache = new TileCache(doc.getPropValue('tileSize'))
    // pre-cache all of the tiles
    doc.getPropValue('sheets').forEach(sht => {
        sht.getPropValue('tiles').forEach(tile => {
            const can = doc.lookup_canvas(tile.getUUID())
            if(can) {
                cache.addCachedTile(tile.getPropValue('name'), tile.getUUID(), {
                    name: tile.getPropValue('name'),
                    id: tile.getUUID(),
                    blocking: tile.getPropValue('blocking'),
                    canvas: can
                })
            }
        })
    })
    doc.getPropValue('canvases').forEach(img => {
        const canvas = document.createElement('canvas')
        canvas.width = img.getPropValue('size').w
        canvas.height = img.getPropValue('size').h
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
        drawImage(ctx,img,doc.getPropValue('palette'),1)
        cache.addCachedTile(img.getPropValue('name'), img.getUUID(), {
            name: img.getPropValue('name'),
            id: img.getUUID(),
            blocking: false,
            canvas: canvas
        })
    })
    // turn each layer of the map into a layer of the engine
    map.getPropValue('layers').forEach(layer => {
        if (layer instanceof TileLayer) {
            const tl = new TilemapLayer()
            tl.type = 'tilemap'
            tl.name = layer.getPropValue('name')
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
        if (layer instanceof ActorLayer) {
            const actors = new ActorsLayer()
            actors.blocking = true
            gamestate.addLayer(actors)
            layer.getPropValue('actors').forEach(inst => {
                const real_actor = findActorForInstance(inst, doc)
                if(real_actor) {
                    const pos = inst.getPropValue('position')
                    const val: Player = {
                        bounds: real_actor.getPropValue('viewbox').add(pos),
                        hidden:false,
                        type: "player",
                        color: 'blue',
                        tile: {
                            uuid: real_actor.getPropValue('sprite')
                        },
                        name: inst.getPropValue('name'),
                        hitable: true,
                        vy:0,
                        vx:0,
                        standing:false,
                    }
                    actors.addActor(val)
                    if(real_actor.getPropValue('kind') === 'player') {
                        gamestate.addPlayer(val)
                    }
                }
            })
        }
    })
    if(physicsDebug) gamestate.addLayer(gamestate.getPhysics())
    return {game_state: gamestate, cache}
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
