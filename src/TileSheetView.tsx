import {Changed, drawEditableSprite, EditableSheet, EditableSprite, PICO8} from "./common";
import React, {useEffect, useRef, useState} from "react";
import {ListView} from "./ListView";
import {toClass} from "josh_react_util";

function TilePreviewRenderer(props: {
    value: EditableSprite,
    selected: any,
    setSelected: (value: any) => void
}) {
    const image = props.value
    const scale = 4
    const ref = useRef<HTMLCanvasElement>(null)
    const redraw = () => {
        if (ref.current) {
            let canvas = ref.current
            let ctx = canvas.getContext('2d') as CanvasRenderingContext2D
            ctx.fillStyle = 'red'
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            drawEditableSprite(ctx, 1, image)
        }
    }
    useEffect(() => redraw(), [image])
    useEffect(() => {
        let hand = () => redraw()
        image.addEventListener(Changed, hand)
        return () => image.removeEventListener(Changed, hand)
    }, [image]);
    return <canvas ref={ref} className={toClass({
        'tile-preview': true,
        selected: props.selected === props.value
    })} style={{
        width: `${image.width() * scale}px`,
        height: `${image.height() * scale}px`,
    }}
                   width={image.width()}
                   height={image.height()}
                   onClick={() => props.setSelected(props.value)}
    ></canvas>
}

export function TileSheetView(props: {
    sheet: EditableSheet,
    tile: EditableSprite,
    setTile: (tile: EditableSprite) => void
}) {
    const {sheet, tile} = props
    const [tiles, setTiles] = useState(sheet.getImages())
    const [name, setName] = useState(sheet.getName())
    const add_tile = () => {
        let new_tile = new EditableSprite(tile.width(), tile.height(), PICO8)
        sheet.addSprite(new_tile)
    }
    useEffect(() => {
        setName(sheet.getName())
        setTiles(sheet.getImages())
        let hand = () => {
            setName(sheet.getName())
            setTiles(sheet.getImages())
        }
        sheet.addEventListener(Changed, hand)
        return () => sheet.removeEventListener(Changed, hand)
    }, [sheet]);
    return <>
        <ul className={'props-sheet'}>
            <li>
                <b>Name</b>
                <input type={'text'} value={name} onChange={(e) => sheet.setName(e.target.value)}/>
            </li>
        </ul>
        <div className={'toolbar'}>
            <button onClick={add_tile}>add tile</button>
        </div>
        <ListView className={'tile-list'} selected={tile}
                  setSelected={props.setTile}
                  renderer={TilePreviewRenderer}
                  data={tiles}
                  style={{}}
        /></>
}
