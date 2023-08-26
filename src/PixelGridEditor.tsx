import React, {MouseEvent, useEffect, useRef, useState} from "react";
import {Point} from "josh_js_util";
import {HBox, toClass} from "josh_react_util";
import {Changed, EditableSprite, ImagePalette, log} from "./model";


function calculateDirections() {
    return [
        new Point(-1,0),
        new Point(1,0),
        new Point(0,-1),
        new Point(0,1)
    ]
}

function bucketFill(tile: EditableSprite, target: number, replace:number, at: Point, ) {
    if(target === replace) return
    let v = tile.getPixel(at)
    if(v !== target) return
    if(v === target) {
        tile.setPixel(replace,at)
        calculateDirections().forEach(dir => {
            let pt = at.add(dir)
            if(tile.isValidIndex(pt)) bucketFill(tile,target,replace,pt)
        })
    }
}

export function PixelGridEditor(props: {
    image: EditableSprite,
    selectedColor: number,
    palette: ImagePalette,
    setSelectedColor: (v:number)=>void
}) {
    const {selectedColor, palette, image} = props
    const [down, setDown] = useState<boolean>(false)
    const [grid, setGrid] = useState<boolean>(false)
    const [fillOnce, setFillOnce] = useState<boolean>(false)
    let scale = 25
    const ref = useRef<HTMLCanvasElement>(null)
    const redraw = () => {
        if (ref.current) {
            let canvas = ref.current
            let ctx = canvas.getContext('2d') as CanvasRenderingContext2D
            ctx.fillStyle = 'red'
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            for (let i = 0; i < image.width(); i++) {
                for (let j = 0; j < image.height(); j++) {
                    let v: number = image.getPixel(new Point(i, j))
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
    useEffect(() => redraw(), [down, grid])
    useEffect(() => {
        redraw()
        let hand = () => redraw()
        image.addEventListener(Changed, hand)
        return () => image.removeEventListener(Changed, hand)
    }, [image]);

    const canvasToImage = (e: MouseEvent<HTMLCanvasElement>) => {
        let rect = (e.target as HTMLCanvasElement).getBoundingClientRect()
        return new Point(e.clientX, e.clientY)
            .subtract(new Point(rect.left, rect.top))
            .scale(1 / scale)
            .floor()
    }


    return <div className={'pane'}>
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
        </HBox>
        <canvas ref={ref}
                style={{
                    border: '1px solid black',
                }}
                width={image.width() * scale}
                height={image.height() * scale}
                onContextMenu={(e) => {
                    e.preventDefault()
                }}
                onMouseDown={(e) => {
                    if(e.button === 2) {
                        props.setSelectedColor(image.getPixel(canvasToImage(e)))
                        e.stopPropagation()
                        e.preventDefault()
                        return
                    }
                    if(fillOnce) {
                        let pt = canvasToImage(e)
                        let current_color = image.getPixel(pt)
                        bucketFill(image,current_color,selectedColor,pt)
                        setFillOnce(false)
                        return
                    }
                    setDown(true)
                    image.setPixel(selectedColor, canvasToImage(e))
                }}
                onMouseMove={(e) => {
                    if (down) {
                        image.setPixel(selectedColor, canvasToImage(e))
                    }
                }}
                onMouseUp={(e) => setDown(false)}>
        </canvas>
    </div>
}
