import {
    drawEditableSprite,
    EditableDocument,
    EditableMap,
    EditableSheet,
    EditableSprite
} from "./model";
import React, {MouseEvent, useEffect, useRef, useState} from "react";
import {Point, Size} from "josh_js_util";
import "./MapEditor.css"
import {toClass} from "josh_react_util";

function calculateDirections() {
    return [
        new Point(-1,0),
        new Point(1,0),
        new Point(0,-1),
        new Point(0,1)
    ]
}

function bucketFill(map: EditableMap, target: string, replace:string, at: Point, ) {
    if(target === replace) return
    let v = map.cells.get(at)
    if(v.tile !== target) return
    if(v.tile === target) {
        map.cells.set(at,{tile:replace})
        calculateDirections().forEach(dir => {
            let pt = at.add(dir)
            // @ts-ignore
            if(map.cells.isValidIndex(pt)) bucketFill(map,target,replace,pt)
        })
    }
}


export function MapEditor(props: {
    doc: EditableDocument,
    map: EditableMap,
    sheet: EditableSheet,
    tile: EditableSprite,
    setSelectedTile:any,
}) {
    const {map, tile} = props
    const [grid, setGrid] = useState<boolean>(false)
    const ref = useRef<HTMLCanvasElement>(null)
    const [down, setDown] = useState<boolean>(false)
    useEffect(() => {
        redraw()
    }, [grid, map])

    const scale = 4
    const redraw = () => {
        if (ref.current) {
            let canvas = ref.current
            let ctx = canvas.getContext('2d') as CanvasRenderingContext2D
            ctx.fillStyle = 'red'
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            let size = new Size(tile.width(),tile.height())
            if(!map) return
            map.cells.forEach((v, n) => {
                if (v) {
                    ctx.save()
                    ctx.translate(n.x * size.w * scale, n.y * size.h * scale)
                    let tile = props.doc.lookup_sprite(v.tile)
                    if(tile) drawEditableSprite(ctx, scale, tile)
                    if (grid) {
                        ctx.strokeStyle = 'gray'
                        ctx.strokeRect(0, 0, size.w * scale-1, size.h * scale-1)
                    }
                    ctx.restore()
                }
            })
        }
    }
    const canvasToImage = (e: MouseEvent<HTMLCanvasElement>) => {
        let rect = (e.target as HTMLCanvasElement).getBoundingClientRect()
        let pt = new Point(e.clientX, e.clientY)
            .subtract(new Point(rect.left, rect.top))
            .scale(1 / scale)
        pt = new Point(pt.x / tile.width(), pt.y / tile.height())
            .floor()
        return pt
    }
    const [fillOnce, setFillOnce] = useState<boolean>(false)

    if(!map)  return <div>select a map</div>
    return <div className={'map-editor'}>
        <div className={'toolbar'}>
            <button onClick={() => setGrid(!grid)}>grid</button>
            <button onClick={() => setFillOnce(true)}
                    className={toClass({ selected:fillOnce })}
            >fill</button>
        </div>
        <div className={'map-editor-canvas-wrapper'}>
        <canvas ref={ref}
                width={map.cells.w*scale*tile.width()}
                height={map.cells.h*scale*tile.height()}
                onContextMenu={(e) => {
                    e.preventDefault()
                }}
                onMouseDown={(e) => {
                    if(e.button === 2) {
                        let cell = map.cells.get(canvasToImage(e))
                        let tile = props.doc.lookup_sprite(cell.tile)
                        if(tile) props.setSelectedTile(tile)
                        e.stopPropagation()
                        e.preventDefault()
                        return
                    }
                    if(fillOnce) {
                        let pt = canvasToImage(e)
                        let cell = map.cells.get(pt)
                        bucketFill(map,cell.tile,tile.id,pt)
                        setFillOnce(false)
                        redraw()
                        return
                    }

                    setDown(true)
                    if(map) map.cells.set(canvasToImage(e),{tile:tile.id})
                    // setCount(count + 1)
                    redraw()
                }}
                onMouseMove={(e) => {
                    if (down) {
                        if(map) map.cells.set(canvasToImage(e), {tile:tile.id})
                        redraw()
                    }
                }}
                onMouseUp={(e) => setDown(false)}
        />
        </div>
    </div>

}
