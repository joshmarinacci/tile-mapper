import {Changed, drawEditableSprite, EditableSprite} from "./common";
import {ArrayGrid, Point} from "josh_js_util";
import React, {MouseEvent, useEffect, useRef, useState} from "react";

export function TestMap(props: { tile: EditableSprite, mapArray: ArrayGrid<EditableSprite> }) {
    const {tile, mapArray} = props
    const ref = useRef<HTMLCanvasElement>(null)
    const [down, setDown] = useState<boolean>(false)
    const [grid, setGrid] = useState<boolean>(false)
    const [count, setCount] = useState(0)

    const scale = 4
    const redraw = () => {
        if (ref.current) {
            let canvas = ref.current
            let ctx = canvas.getContext('2d') as CanvasRenderingContext2D
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
        let hand = () => redraw()
        tile.addEventListener(Changed, hand)
        return () => tile.removeEventListener(Changed, hand)
    }, [tile]);

    const canvasToImage = (e: MouseEvent<HTMLCanvasElement>) => {
        let rect = (e.target as HTMLCanvasElement).getBoundingClientRect()
        return new Point(e.clientX, e.clientY)
            .subtract(new Point(rect.left, rect.top))
            .scale(1 / scale)
            .scale(1 / tile.width())
            .floor()
    }
    return <div>
        <div className={'toolbar'}>
            <button onClick={() => setGrid(!grid)}>grid</button>
        </div>
        <canvas ref={ref} width={300} height={300}
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
                onMouseUp={(e) => setDown(false)}
        />
    </div>

}
