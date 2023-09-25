import {ArrayGrid, Point} from "josh_js_util"
import {toClass} from "josh_react_util"
import React from "react"

import {drawEditableSprite} from "../common"
import {GameDoc, MapCell, TileLayer} from "../datamodel"

function calculateDirections() {
    return [
        new Point(-1, 0),
        new Point(1, 0),
        new Point(0, -1),
        new Point(0, 1)
    ]
}

export function bucketFill(layer: TileLayer, target: string, replace: string, at: Point,) {
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

export function drawTileLayer(ctx: CanvasRenderingContext2D,
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

export function TileLayerToolbar(props: {
    doc: GameDoc,
    layer: TileLayer,
    fillOnce: boolean,
    setFillOnce: (fw: boolean) => void
}) {
    const {fillOnce, setFillOnce} = props
    return <div className={'toolbar'}>
        <label>tiles</label>
        <button onClick={() => setFillOnce(true)}
                className={toClass({selected: fillOnce})}>fill
        </button>
    </div>
}
