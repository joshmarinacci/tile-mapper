import "./MapEditor.css"

import {ArrayGrid, Point} from "josh_js_util"
import {toClass} from "josh_react_util"
import {canvas_to_blob, forceDownloadBlob} from "josh_web_util"
import React, {MouseEvent, useEffect, useRef, useState} from "react"

import {appendToList, PropsBase, useWatchProp} from "./base"
import {drawEditableSprite} from "./common"
import {
    ActorInstance,
    ActorLayer,
    GameDoc,
    GameMap,
    MapCell,
    MapLayerType,
    Tile,
    TileLayer
} from "./datamodel"
import {fillBounds, strokeBounds} from "./engine/util"

function calculateDirections() {
    return [
        new Point(-1, 0),
        new Point(1, 0),
        new Point(0, -1),
        new Point(0, 1)
    ]
}

function bucketFill(layer: TileLayer, target: string, replace: string, at: Point,) {
    if (target === replace) return
    const cells = layer.getPropValue('data') as ArrayGrid<MapCell>
    const v = cells.get(at)
    if (v.tile !== target) return
    if (v.tile === target) {
        cells.set(at, {tile: replace})
        calculateDirections().forEach(dir => {
            const pt = at.add(dir)
            if (cells.isValidIndex(pt)) bucketFill(layer, target, replace, pt)
        })
    }
}


function map_to_canvas(map: GameMap, doc: GameDoc, scale: number): HTMLCanvasElement {
    console.log("doc is", doc)
    const canvas = document.createElement('canvas')
    const mapSize = map.calcBiggestLayer()
    const size = doc.getPropValue('tileSize')
    canvas.width = mapSize.w * scale * size.w
    canvas.height = mapSize.h * scale * size.h
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
    ctx.imageSmoothingEnabled = false
    map.getPropValue('layers').forEach(layer => {
        if (layer instanceof TileLayer) {
            const cells = layer.getPropValue('data')
            cells.forEach((v, n) => {
                if (v) {
                    const x = n.x * size.w * scale
                    const y = n.y * size.w * scale
                    const tile = doc.lookup_sprite(v.tile)
                    if (tile) {
                        if (tile.cache_canvas) {
                            ctx.drawImage(tile.cache_canvas,
                                //src
                                0, 0, tile.cache_canvas.width, tile.cache_canvas.height,
                                //dst
                                x,
                                y,
                                size.w * scale, size.h * scale
                            )
                        } else {
                            drawEditableSprite(ctx, scale, tile)
                        }
                    }
                }

            })
        }
    })
    return canvas
}

async function exportPNG(doc: GameDoc, map: GameMap, scale: number) {
    const can = map_to_canvas(map, doc, scale)
    const blob = await canvas_to_blob(can)
    forceDownloadBlob(`${map.getPropValue('name') as string}.${scale}x.png`, blob)
}

function drawTileLayer(ctx: CanvasRenderingContext2D,
                       doc: GameDoc,
                       layer: TileLayer,
                       scale: number, grid: boolean) {
    const size = doc.getPropValue('tileSize')
    const cells = layer.getPropValue('data') as ArrayGrid<MapCell>
    cells.forEach((v, n) => {
        if (v) {
            const x = n.x * size.w * scale
            const y = n.y * size.w * scale
            const tile = doc.lookup_sprite(v.tile)
            if (tile) {
                if (tile.cache_canvas) {
                    ctx.drawImage(tile.cache_canvas,
                        //src
                        0, 0, tile.cache_canvas.width, tile.cache_canvas.height,
                        //dst
                        x,
                        y,
                        size.w * scale, size.h * scale
                    )
                } else {
                    drawEditableSprite(ctx, scale, tile)
                }
            }
            if (grid) {
                ctx.strokeStyle = 'gray'
                ctx.strokeRect(x, y, size.w * scale - 1, size.h * scale - 1)
            }
        }
    })

}

function findActorForInstance(inst:ActorInstance,doc:GameDoc) {
    const actor_id = inst.getPropValue('actor')
    return doc.getPropValue('actors').find(act => act._id === actor_id)
}
function drawActorlayer(ctx: CanvasRenderingContext2D, doc: GameDoc, layer: ActorLayer, scale: number, grid: boolean) {
    ctx.fillStyle = 'rgba(255,0,0,0.5)'
    ctx.fillRect(0,0,100,100)
    layer.getPropValue('actors').forEach(inst => {
        const position = inst.getPropValue('position')
        const source = findActorForInstance(inst,doc)
        if(source) {
            const box = source.getPropValue('viewbox')
            fillBounds(ctx,box.add(position).scale(scale),'red')
        }
    })
}

function TileLayerToolbar(props:{doc:GameDoc, layer:TileLayer}) {
    return <div className={'toolbar'}>
        <label>tiles</label>
    </div>
}

function ActorLayerToolbar(props:{doc:GameDoc, layer:ActorLayer, onSelect:(act:ActorInstance) => void}) {
    const [selected, setSelected] = useState<string>("nothing")
    const add_actor = () => {
        const player = new ActorInstance({name:'new ref', actor:selected, position: new Point(50,30)})
        appendToList(props.layer,"actors", player)
        props.onSelect(player)
    }
    return <div className={'toolbar'}>
        <label>actors</label>
        <select value={selected} onChange={(e) => {
            setSelected(e.target.value)
        }}><option key={'nothing'} value={'nothing'}>unselected</option>
            {
                props.doc.getPropValue('actors').map(act => {
                    return <option key={act._id} value={act._id}>{act.getPropValue('name')}</option>
                })
            }
        </select>
        <button disabled={selected === 'nothing'} onClick={add_actor}>add actor</button>
    </div>
}

function drawSelectedActor(ctx: CanvasRenderingContext2D, doc: GameDoc, inst: ActorInstance, scale: number, grid: boolean) {
    const position = inst.getPropValue('position')
    const source = findActorForInstance(inst,doc)
    if(source) {
        const box = source.getPropValue('viewbox')
        strokeBounds(ctx,box.add(position).scale(scale),'orange',3)
    }
}

function findActorAtPosition(doc:GameDoc, layer: ActorLayer, point: Point) {
    return layer.getPropValue('actors').find(inst => {
        const actt = findActorForInstance(inst,doc)
        if(actt) {
            const box = actt.getPropValue('viewbox').add(inst.getPropValue('position'))
            console.log("box is",box)
            if(box.contains(point)) {
                return true
            }
        }
        return false
    })
}

export function LayerEditor(props: {
    doc: GameDoc,
    map: GameMap,
    layer: PropsBase<MapLayerType>,
    tile: Tile,
    setSelectedTile: (sprite: Tile) => void,
}) {
    const {map, layer, tile, doc} = props
    const [grid, setGrid] = useState<boolean>(false)
    const [selectedActor, setSelectedActor] = useState<ActorInstance|undefined>(undefined)
    const ref = useRef<HTMLCanvasElement>(null)
    const [down, setDown] = useState<boolean>(false)
    useEffect(() => redraw(), [grid, layer, selectedActor])

    const [zoom, setZoom] = useState(2)
    const scale = Math.pow(2, zoom)
    const biggest = map.calcBiggestLayer()
    const tileSize = doc.getPropValue('tileSize')
    useWatchProp(map,"layers")
    const redraw = () => {
        if (ref.current) {
            const canvas = ref.current
            const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
            ctx.imageSmoothingEnabled = false
            ctx.fillStyle = 'magenta'
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            map.getPropValue('layers').forEach((layer:PropsBase<MapLayerType>) => {
                if(!layer.getPropValue('visible')) return
                // console.log("layer is",layer, layer.getPropValue('type'), layer instanceof TileLayer, layer instanceof ActorLayer)
                if (layer instanceof TileLayer) {
                    drawTileLayer(ctx, doc, layer as TileLayer, scale, grid)
                }
                if (layer instanceof ActorLayer) {
                    drawActorlayer(ctx, doc, layer as ActorLayer, scale, grid)
                }
            })
            if(selectedActor) {
                drawSelectedActor(ctx,doc,selectedActor,scale,grid)
            }
        }
    }
    const canvasToImage = (e: MouseEvent<HTMLCanvasElement>) => {
        const rect = (e.target as HTMLCanvasElement).getBoundingClientRect()
        let pt = new Point(e.clientX, e.clientY)
            .subtract(new Point(rect.left, rect.top))
            .scale(1 / scale)
        pt = new Point(pt.x / tileSize.w, pt.y / tileSize.h).floor()
        return pt
    }
    const canvasToLayer = (e:MouseEvent<HTMLCanvasElement>) => {
        const rect = (e.target as HTMLCanvasElement).getBoundingClientRect()
        const pt = new Point(e.clientX, e.clientY)
            .subtract(new Point(rect.left, rect.top))
            .scale(1 / scale)
        return pt
    }
    const [fillOnce, setFillOnce] = useState<boolean>(false)

    useEffect(() => redraw(), [zoom, layer])

    const onMouseDown = (e: MouseEvent<HTMLCanvasElement>) => {
        if (e.button === 2) {
            const cell = layer.getPropValue('data').get(canvasToImage(e))
            const tile = props.doc.lookup_sprite(cell.tile)
            if (tile) props.setSelectedTile(tile)
            e.stopPropagation()
            e.preventDefault()
            return
        }
        if (fillOnce) {
            const pt = canvasToImage(e)
            const cell = layer.getPropValue('data').get(pt)
            bucketFill(layer, cell.tile, tile._id, pt)
            setFillOnce(false)
            redraw()
            return
        }

        setDown(true)
        if (layer instanceof TileLayer) {
            const cells = layer.getPropValue('data') as ArrayGrid<MapCell>
            cells.set(canvasToImage(e), {tile: tile._id})
        }
        if (layer instanceof ActorLayer) {
            setSelectedActor(findActorAtPosition(doc,layer,canvasToLayer(e)))
        }
        redraw()
    }
    const onMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
        if (down) {
            if (layer instanceof TileLayer) {
                const cells = layer.getPropValue('data') as ArrayGrid<MapCell>
                cells.set(canvasToImage(e), {tile: tile._id})
            }
            if (layer instanceof ActorLayer && selectedActor) {
                const pt = canvasToLayer(e)
                selectedActor.setPropValue('position',pt)
            }
            redraw()
        }
    }
    const onMouseUp = (e: MouseEvent<HTMLCanvasElement>) => {
        setDown(false)
    }
    if (!layer) return <div>select a map</div>
    return <div className={'vbox'}>
        <div className={'toolbar'}>
            <button onClick={() => setGrid(!grid)}>grid</button>
            <button onClick={() => setFillOnce(true)}
                    className={toClass({selected: fillOnce})}>fill
            </button>
            <button onClick={() => setZoom(zoom + 1)}>+</button>
            <button onClick={() => setZoom(zoom - 1)}>-</button>
            <button onClick={() => exportPNG(doc, map, 1)}>png 1x</button>
            <button onClick={() => exportPNG(doc, map, 2)}>png 2x</button>
            <button onClick={() => exportPNG(doc, map, 4)}>png 4x</button>
        </div>
        {layer.getPropValue('type') === 'tile-layer' && <TileLayerToolbar layer={layer as TileLayer} doc={doc}/>}
        {layer.getPropValue('type') === 'actor-layer' && <ActorLayerToolbar layer={layer as ActorLayer} doc={doc} onSelect={setSelectedActor}/>}
        <div className={'map-editor-canvas-wrapper'}>
            <canvas ref={ref}
                    width={biggest.w * scale * tileSize.w}
                    height={biggest.h * scale * tileSize.h}
                    onContextMenu={(e) => e.preventDefault()}
                    onMouseDown={onMouseDown}
                    onMouseMove={onMouseMove}
                    onMouseUp={onMouseUp}
            />
        </div>
    </div>

}
