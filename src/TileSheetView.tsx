import {
    canvas_to_bmp,
    Changed,
    drawEditableSprite,
    EditableSheet,
    EditableSprite, ImagePalette,
    PICO8,
    sheet_to_canvas
} from "./common";
import React, {useEffect, useRef, useState} from "react";
import {ListView} from "./ListView";
import {toClass} from "josh_react_util";
import {forceDownloadBlob} from "josh_web_util";

function TilePreviewRenderer(props: {
    value: EditableSprite,
    index: number,
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
    return <div className={'tile-preview-wrapper'}>
        <canvas ref={ref} className={toClass({
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
        <b>{props.index}</b>
    </div>
}

export function TileSheetView(props: {
    sheet: EditableSheet,
    tile: EditableSprite,
    setTile: (tile: EditableSprite) => void,
    palette: ImagePalette,
    editable:boolean,
}) {
    const {sheet, tile, setTile, palette, editable} = props
    const [tiles, setTiles] = useState(sheet.getImages())
    const [name, setName] = useState(sheet.getName())
    const add_tile = () => {
        let new_tile = new EditableSprite(tile.width(), tile.height(), PICO8)
        sheet.addSprite(new_tile)
        setTile(new_tile)
    }
    const dup_tile = () => {
        let new_tile = tile.clone()
        sheet.addSprite(new_tile)
        setTile(new_tile)
    }
    const delete_tile = () => {
        sheet.removeSprite(tile)
        if(sheet.getImages().length > 0) {
            setTile(sheet.getImages()[0])
        }
    }
    const export_bmp = () => {
        const canvas = sheet_to_canvas(sheet)
        const rawData = canvas_to_bmp(canvas, palette)
        let blob = new Blob([rawData.data], {type:'image/bmp'})
        forceDownloadBlob(`${sheet.getName()}.bmp`,blob)
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
        {editable &&
            <ul className={'props-sheet'}>
                <li>
                    <b>Name</b>
                    <input type={'text'} value={name} onChange={(e) => sheet.setName(e.target.value)}/>
                </li>
            </ul>}
        {editable &&
            <div className={'toolbar'}>
                <button onClick={add_tile}>add tile</button>
                <button onClick={dup_tile}>dup tile</button>
                <button onClick={delete_tile}>del tile</button>
            </div>}
        <ListView className={'tile-list'} selected={tile}
                  setSelected={setTile}
                  renderer={TilePreviewRenderer}
                  data={tiles}
                  style={{}}
        />
        {editable &&
        <div className={'toolbar'}>
            <button onClick={export_bmp}>to BMP</button>
        </div>}
    </>
}
