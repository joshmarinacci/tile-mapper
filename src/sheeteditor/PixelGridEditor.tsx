import {Point} from "josh_js_util"
import {HBox, toClass} from "josh_react_util"
import React, {MouseEvent, useEffect, useRef, useState} from "react"

import {ImagePalette} from "../common/common"
import {ICON_CACHE} from "../iconcache"
import {Tile} from "../model/datamodel"


function calculateDirections() {
    return [
        new Point(-1,0),
        new Point(1,0),
        new Point(0,-1),
        new Point(0,1)
    ]
}

function bucketFill(tile: Tile, target: number, replace:number, at: Point, ) {
    if(target === replace) return
    const v = tile.getPixel(at)
    if(v !== target) return
    if(v === target) {
        tile.setPixel(replace,at)
        calculateDirections().forEach(dir => {
            const pt = at.add(dir)
            if(tile.isValidIndex(pt)) bucketFill(tile,target,replace,pt)
        })
    }
}

export function PixelGridEditor(props: {
    tile: Tile,
    selectedColor: number,
    palette: ImagePalette,
    setSelectedColor: (v:number)=>void
}) {
    const {selectedColor, palette, tile} = props
    const [down, setDown] = useState<boolean>(false)
    const [grid, setGrid] = useState<boolean>(false)
    const [fillOnce, setFillOnce] = useState<boolean>(false)
    const [zoom, setZoom] = useState<number>(5)
    const scale = Math.pow(2,zoom)
    const ref = useRef<HTMLCanvasElement>(null)
    const redraw = () => {
        if (ref.current) {
            const canvas = ref.current
            const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
            ctx.fillStyle = 'magenta'
            const pat = ctx.createPattern(ICON_CACHE.getIconCanvas('checkerboard'),'repeat') as CanvasPattern
            ctx.fillStyle = pat
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            for (let i = 0; i < tile.width(); i++) {
                for (let j = 0; j < tile.height(); j++) {
                    const v: number = tile.getPixel(new Point(i, j))
                    ctx.fillStyle = palette[v]
                    ctx.fillRect(i * scale, j * scale, scale, scale)
                    if (grid) {
                        ctx.strokeStyle = 'black'
                        ctx.strokeRect(i * scale, j * scale, scale, scale)
                    }
                }
            }
        }
    }
    useEffect(() => redraw(), [down, grid, zoom])
    useEffect(() => {
        redraw()
        const hand = () => redraw()
        tile.onAny(hand)
        return () => tile.offAny(hand)
    }, [tile])

    const canvasToImage = (e: MouseEvent<HTMLCanvasElement>) => {
        const rect = (e.target as HTMLCanvasElement).getBoundingClientRect()
        return new Point(e.clientX, e.clientY)
            .subtract(new Point(rect.left, rect.top))
            .scale(1 / scale)
            .floor()
    }


    return <div className={'pane'} style={{
        overflow:'scroll',
        maxWidth: 'unset'
    }}>
        <header>Edit</header>
        <HBox className={'hbox toolbar'}>
            <button
                className={toClass({ selected: grid, })}
                onClick={() => setGrid(!grid)}
            >grid</button>
            <button
                className={toClass({ selected:fillOnce })}
                onClick={()=>setFillOnce(true)}
            >fill once</button>
            <button
                className={toClass({ selected:fillOnce })}
                onClick={()=>setZoom(zoom+1)}
            >+</button>
            <label>{zoom}</label>
            <button
                className={toClass({ selected:fillOnce })}
                onClick={()=>setZoom(zoom-1)}
            >-</button>
        </HBox>
        <canvas ref={ref}
                style={{
                    border: '1px solid black',
                    width: `${tile.width()*scale}px`,
                    height: `${tile.height()*scale}px`,
                }}
                width={tile.width() * scale}
                height={tile.height() * scale}
                onContextMenu={(e) => {
                    e.preventDefault()
                }}
                onMouseDown={(e) => {
                    if(e.button === 2) {
                        props.setSelectedColor(tile.getPixel(canvasToImage(e)))
                        e.stopPropagation()
                        e.preventDefault()
                        return
                    }
                    if(fillOnce) {
                        const pt = canvasToImage(e)
                        const current_color = tile.getPixel(pt)
                        bucketFill(tile,current_color,selectedColor,pt)
                        setFillOnce(false)
                        return
                    }
                    setDown(true)
                    tile.setPixel(selectedColor, canvasToImage(e))
                }}
                onMouseMove={(e) => {
                    if (down) {
                        tile.setPixel(selectedColor, canvasToImage(e))
                    }
                }}
                onMouseUp={() => setDown(false)}>
        </canvas>
    </div>
}
