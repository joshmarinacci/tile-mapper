import "../MapEditor.css"

import {ArrayGrid, Point} from "josh_js_util"
import {Spacer} from "josh_react_util"
import React, {MouseEvent, useContext, useEffect, useRef, useState} from "react"

import {exportPNG} from "../actions"
import {PropsBase, useWatchAllProps, useWatchProp} from "../base"
import {DocContext} from "../common-components"
import {
    ActorInstance,
    ActorLayer,
    GameMap,
    MapCell,
    MapLayerType,
    Tile,
    TileLayer
} from "../datamodel"
import {
    ActorLayerToolbar,
    drawActorlayer,
    drawSelectedActor,
    findActorAtPosition
} from "./ActorEditor"
import {bucketFill, drawTileLayer, TileLayerToolbar} from "./TileEditor"


export function LayerEditor(props: {
    map: GameMap,
    layer: PropsBase<MapLayerType>,
    tile: Tile,
    setSelectedTile: (sprite: Tile) => void,
}) {
    const {map, layer, tile} = props
    const doc = useContext(DocContext)
    const [grid, setGrid] = useState<boolean>(false)
    const [selectedActor, setSelectedActor] = useState<ActorInstance | undefined>(undefined)
    const ref = useRef<HTMLCanvasElement>(null)
    const [down, setDown] = useState<boolean>(false)
    useEffect(() => redraw(), [grid, layer, selectedActor])

    const [zoom, setZoom] = useState(2)
    const scale = Math.pow(2, zoom)
    const biggest = map.calcBiggestLayer()
    const tileSize = doc.getPropValue('tileSize')
    useWatchProp(map, "layers")
    const redraw = () => {
        if (ref.current) {
            const canvas = ref.current
            const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
            ctx.imageSmoothingEnabled = false
            ctx.fillStyle = 'magenta'
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            map.getPropValue('layers').forEach((layer: PropsBase<MapLayerType>) => {
                if (!layer.getPropValue('visible')) return
                // console.log("layer is",layer, layer.getPropValue('type'), layer instanceof TileLayer, layer instanceof ActorLayer)
                if (layer instanceof TileLayer) {
                    drawTileLayer(ctx, doc, layer as TileLayer, scale, grid)
                }
                if (layer instanceof ActorLayer) {
                    drawActorlayer(ctx, doc, layer as ActorLayer, scale, grid)
                }
            })
            if (selectedActor) {
                drawSelectedActor(ctx, doc, selectedActor, scale, grid)
            }
        }
    }
    useWatchAllProps(map, () => redraw())
    const canvasToImage = (e: MouseEvent<HTMLCanvasElement>) => {
        const rect = (e.target as HTMLCanvasElement).getBoundingClientRect()
        let pt = new Point(e.clientX, e.clientY)
            .subtract(new Point(rect.left, rect.top))
            .scale(1 / scale)
        pt = new Point(pt.x / tileSize.w, pt.y / tileSize.h).floor()
        return pt
    }
    const canvasToLayer = (e: MouseEvent<HTMLCanvasElement>) => {
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
            const tile = doc.lookup_sprite(cell.tile)
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
            setSelectedActor(findActorAtPosition(doc, layer, canvasToLayer(e)))
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
                selectedActor.setPropValue('position', pt)
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
            <button onClick={() => setZoom(zoom + 1)}>+</button>
            <button onClick={() => setZoom(zoom - 1)}>-</button>
            <Spacer/>
            <button onClick={() => exportPNG(doc, map, 1)}>png 1x</button>
            <button onClick={() => exportPNG(doc, map, 2)}>png 2x</button>
            <button onClick={() => exportPNG(doc, map, 4)}>png 4x</button>
        </div>
        {layer.getPropValue('type') === 'tile-layer' &&
            <TileLayerToolbar layer={layer as TileLayer} doc={doc} fillOnce={fillOnce} setFillOnce={setFillOnce}/>}
        {layer.getPropValue('type') === 'actor-layer' &&
            <ActorLayerToolbar layer={layer as ActorLayer} doc={doc} onSelect={setSelectedActor}/>}
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
