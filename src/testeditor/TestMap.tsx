import {ArrayGrid, Point} from "josh_js_util"
import React, {MouseEvent, useEffect, useRef, useState} from "react"

import {drawEditableSprite} from "../common/common"
import {Tile} from "../model/datamodel"

export function TestMap(props: { tile: Tile|null, mapArray: ArrayGrid<Tile> }) {
    const {tile, mapArray} = props
    const ref = useRef<HTMLCanvasElement>(null)
    const [down, setDown] = useState<boolean>(false)
    const [grid, setGrid] = useState<boolean>(false)
    const [count, setCount] = useState(0)

    const scale = 4
    const redraw = () => {
        if (ref.current) {
            const canvas = ref.current
            const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
            ctx.fillStyle = 'red'
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            mapArray.forEach((v, n) => {
                if (v) {
                    ctx.save()
                    ctx.translate(n.x * tile.width() * scale, n.y * tile.height() * scale)
                    drawEditableSprite(ctx, scale, v)
                    if (grid) {
                        ctx.strokeStyle = 'gray'
                        ctx.strokeRect(0, 0, tile.width() * scale, tile.height() * scale)
                    }
                    ctx.restore()
                }
            })
        }
    }
    useEffect(() => {
        redraw()
    }, [grid, count])

    useEffect(() => {
        redraw()
        const hand = () => redraw()
        tile.onAny(hand)
        return () => tile.offAny(hand)
    }, [tile])

    const canvasToImage = (e: MouseEvent<HTMLCanvasElement>) => {
        const rect = (e.target as HTMLCanvasElement).getBoundingClientRect()
        let pt = new Point(e.clientX, e.clientY)
            .subtract(new Point(rect.left, rect.top))
            .scale(1 / scale)
        pt = new Point(pt.x / tile.width(), pt.y / tile.height())
            .floor()
        return pt
    }
    return <div style={{ overflow:'auto' }}>
        <div className={'toolbar'}>
            <button onClick={() => setGrid(!grid)}>grid</button>
        </div>
        <canvas ref={ref} width={32*10} height={32*10}
                onMouseDown={(e) => {
                    setDown(true)
                    mapArray.set(canvasToImage(e), tile)
                    setCount(count + 1)
                    redraw()
                }}
                onMouseMove={(e) => {
                    if (down) {
                        mapArray.set(canvasToImage(e), tile)
                        redraw()
                    }
                }}
                onMouseUp={() => setDown(false)}
        />
    </div>

}
