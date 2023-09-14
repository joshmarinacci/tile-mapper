import {toClass} from "josh_react_util"
import {forceDownloadBlob} from "josh_web_util"
import React, {useEffect, useRef, useState} from "react"

import {ListView, ListViewRenderer} from "./ListView"
import {
    canvas_to_bmp,
    drawEditableSprite,
    EditableSheet,
    EditableSprite, ImagePalette,
    PICO8,
    sheet_to_canvas
} from "./model"
import {PropSheet} from "./propsheet"

const TilePreviewRenderer:ListViewRenderer<EditableSprite> = (props:{value:EditableSprite, selected:boolean, index:number}) => {
    const image = props.value
    const scale = 4
    const ref = useRef<HTMLCanvasElement>(null)
    const redraw = () => {
        if (ref.current) {
            const canvas = ref.current
            const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
            ctx.fillStyle = 'red'
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            drawEditableSprite(ctx, 1, image)
        }
    }
    useEffect(() => redraw(), [image])
    useEffect(() => {
        const hand = () => redraw()
        image.onAny(hand)
        return () => image.offAny(hand)
    }, [image])
    return <div className={'tile-preview-wrapper'}>
        <canvas ref={ref} className={toClass({
        'tile-preview': true,
        selected: props.selected,
    })} style={{
        width: `${image.width() * scale}px`,
        height: `${image.height() * scale}px`,
    }}
                   width={image.width()}
                   height={image.height()}
    ></canvas>
        <b>{props.value.getPropValue('name')}</b>
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
    const add_tile = () => {
        const new_tile = new EditableSprite(tile.width(), tile.height(), PICO8)
        sheet.addSprite(new_tile)
        setTile(new_tile)
    }
    const dup_tile = () => {
        const new_tile = tile.clone()
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
        const blob = new Blob([rawData.data], {type:'image/bmp'})
        forceDownloadBlob(`${sheet.getPropValue('name')}.bmp`,blob)
    }
    useEffect(() => {
        setTiles(sheet.getImages())
        const hand = () => setTiles(sheet.getImages())
        sheet.onAny(hand)
        return () => sheet.offAny(hand)
    }, [sheet])
    return <>
        {editable && <PropSheet target={sheet}/>}
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
