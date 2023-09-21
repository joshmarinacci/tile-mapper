import "./MapEditor.css"

import {ArrayGrid, Point, Size} from "josh_js_util"
import {toClass} from "josh_react_util"
import {canvas_to_blob, forceDownloadBlob} from "josh_web_util"
import React, {MouseEvent, useEffect, useRef, useState} from "react"

import {ActorLayer, Doc2, Map2, Sheet2, Tile2, TileLayer2} from "./data2"
import {
    MapCell,
} from "./defs"
import {
    drawEditableSprite,
} from "./model"

function calculateDirections() {
    return [
        new Point(-1,0),
        new Point(1,0),
        new Point(0,-1),
        new Point(0,1)
    ]
}

function bucketFill(layer: TileLayer2, target: string, replace:string, at: Point, ) {
    if(target === replace) return
    const cells = layer.getPropValue('data') as ArrayGrid<MapCell>
    const v = cells.get(at)
    if(v.tile !== target) return
    if(v.tile === target) {
        cells.set(at,{tile:replace})
        calculateDirections().forEach(dir => {
            const pt = at.add(dir)
            if(cells.isValidIndex(pt)) bucketFill(layer,target,replace,pt)
        })
    }
}


function map_to_canvas(map: Map2, tile: Tile2, doc: Doc2, scale: number):HTMLCanvasElement {
    const canvas = document.createElement('canvas')
    const mapSize = map.getPropValue('size') as Size
    canvas.width = mapSize.w*scale*tile.width()
    canvas.height = mapSize.h*scale*tile.height()
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
    ctx.imageSmoothingEnabled = false
    const size = new Size(tile.width(),tile.height())
    map.cells.forEach((v, n) => {
        if (v) {
            const x = n.x*size.w*scale
            const y = n.y*size.w*scale
            const tile = doc.lookup_sprite(v.tile)
            if(tile) {
                if(tile.cache_canvas) {
                    ctx.drawImage(tile.cache_canvas,
                        //src
                        0,0,tile.cache_canvas.width,tile.cache_canvas.height,
                        //dst
                        x,
                        y,
                        size.w*scale,size.h*scale
                    )
                } else {
                    drawEditableSprite(ctx, scale, tile)
                }
            }
        }
    })
    return canvas
}

async function exportPNG(doc:Doc2, map: Map2, tile:Tile2, scale: number) {
    const can = map_to_canvas(map,tile, doc,scale)
    const blob = await canvas_to_blob(can)
    forceDownloadBlob(`${map.getPropValue('name') as string}.${scale}x.png`, blob)
}

function drawTileLayer(ctx: CanvasRenderingContext2D,
                       doc:Doc2,
                       layer: TileLayer2,
                       scale:number, grid:boolean) {
    const size = new Size(10,10)
    console.log("drawing doc2",doc.getPropValue('name'))
    const cells = layer.getPropValue('data') as ArrayGrid<MapCell>
    cells.forEach((v, n) => {
        if (v) {
            const x = n.x*size.w*scale
            const y = n.y*size.w*scale
            const tile = doc.lookup_sprite(v.tile)
            if(tile) {
                if(tile.cache_canvas) {
                    ctx.drawImage(tile.cache_canvas,
                        //src
                        0,0,tile.cache_canvas.width,tile.cache_canvas.height,
                        //dst
                        x,
                        y,
                        size.w*scale,size.h*scale
                        )
                } else {
                    drawEditableSprite(ctx, scale, tile)
                }
            }
            if (grid) {
                ctx.strokeStyle = 'gray'
                ctx.strokeRect(x, y, size.w * scale-1, size.h * scale-1)
            }
        }
    })

}

export function LayerEditor(props: {
    doc: Doc2,
    map: Map2,
    layer: TileLayer2,
    sheet: Sheet2,
    tile: Tile2,
    setSelectedTile:(sprite:Tile2) => void,
}) {
    const {map, layer, sheet, tile, doc} = props
    const [grid, setGrid] = useState<boolean>(false)
    const ref = useRef<HTMLCanvasElement>(null)
    const [down, setDown] = useState<boolean>(false)
    useEffect(() => redraw(), [grid, layer])

    const [zoom, setZoom] = useState(2)
    const scale = Math.pow(2,zoom)
    const biggest = new Size(0,0)
    map.getPropValue('layers').forEach(layer => {
        if(layer instanceof TileLayer2) {
            const size = layer.getPropValue('size')
            if(size.w > biggest.w) biggest.w = size.w
            if(size.h > biggest.h) biggest.h = size.h
            console.log("checking",size)
        }
    })
    console.log("biggest size is",biggest)
    const redraw = () => {
        if (ref.current) {
            const canvas = ref.current
            const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
            ctx.imageSmoothingEnabled = false
            ctx.fillStyle = 'red'
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            // const size = new Size(tile.width(),tile.height())
            map.getPropValue('layers').forEach(layer => {
                if(layer instanceof TileLayer2) {
                    drawTileLayer(ctx, doc, layer as TileLayer2, scale, grid)
                }
                if(layer instanceof ActorLayer) {
                    // drawActorlayer(ctx)
                }
            })
            // if(!layer) return
        }
    }
    const canvasToImage = (e: MouseEvent<HTMLCanvasElement>) => {
        const rect = (e.target as HTMLCanvasElement).getBoundingClientRect()
        let pt = new Point(e.clientX, e.clientY)
            .subtract(new Point(rect.left, rect.top))
            .scale(1 / scale)
        pt = new Point(pt.x / tile.width(), pt.y / tile.height())
            .floor()
        return pt
    }
    const [fillOnce, setFillOnce] = useState<boolean>(false)

    useEffect(() => redraw(),[zoom])

    const onMouseDown = (e:MouseEvent<HTMLCanvasElement>) => {
        if(e.button === 2) {
            const cell = layer.getPropValue('data').get(canvasToImage(e))
            const tile = props.doc.lookup_sprite(cell.tile)
            if(tile) props.setSelectedTile(tile)
            e.stopPropagation()
            e.preventDefault()
            return
        }
        if(fillOnce) {
            const pt = canvasToImage(e)
            const cell = layer.getPropValue('data').get(pt)
            bucketFill(layer,cell.tile,tile._id,pt)
            setFillOnce(false)
            redraw()
            return
        }

        setDown(true)
        if(layer instanceof TileLayer2) {
            console.log("writing to tile layer", canvasToImage(e), tile._id)
            const cells = layer.getPropValue('data') as ArrayGrid<MapCell>
            cells.set(canvasToImage(e),{tile:tile._id})
        }// setCount(count + 1)
        redraw()

    }
    const onMouseMove = (e:MouseEvent<HTMLCanvasElement>) => {
        if (down) {
            if(layer instanceof TileLayer2) {
                const cells = layer.getPropValue('data') as ArrayGrid<MapCell>
                cells.set(canvasToImage(e), {tile:tile._id})
            }
            redraw()
        }
    }
    const onMouseUp = (e:MouseEvent<HTMLCanvasElement>) => {
        setDown(false)
    }
    if(!layer)  return <div>select a map</div>
    return <div className={'vbox'}>
        <div className={'toolbar'}>
            <button onClick={() => setGrid(!grid)}>grid</button>
            <button onClick={() => setFillOnce(true)} className={toClass({ selected:fillOnce })}>fill</button>
            <button onClick={()=>setZoom(zoom+1)}>+</button>
            <button onClick={()=>setZoom(zoom-1)}>-</button>
            {/*<button onClick={()=>exportPNG(doc, map,tile,1)}>png 1x</button>*/}
            {/*<button onClick={()=>exportPNG(doc, map,tile,2)}>png 2x</button>*/}
            {/*<button onClick={()=>exportPNG(doc, map,tile,4)}>png 4x</button>*/}
        </div>
        <div className={'map-editor-canvas-wrapper'}>
        <canvas ref={ref}
                width={biggest.w*scale*tile.width()}
                height={biggest.h*scale*tile.height()}
                onContextMenu={(e) => e.preventDefault()}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
        />
        </div>
    </div>

}
