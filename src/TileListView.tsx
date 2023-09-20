import "./TileSheetView.css"

import {Size} from "josh_js_util"
import {toClass} from "josh_react_util"
import React, {useEffect, useRef, useState} from "react"

import {Sheet2, Tile2} from "./defs"
import {ListView, ListViewDirection, ListViewRenderer} from "./ListView"
import {drawEditableSprite, ImagePalette, PICO8} from "./model"

const TilePreviewRenderer:ListViewRenderer<Tile2> = (props:{value:Tile2, selected:boolean, index:number}) => {
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


export function TileListView(props: {
    sheet: Sheet2,
    tile: Tile2,
    setTile: (tile: Tile2) => void,
    palette: ImagePalette,
    editable:boolean,
}) {
    const {sheet, tile, setTile, palette, editable} = props
    const [tiles, setTiles] = useState(sheet.getPropValue('tiles'))
    const add_tile = () => {
        const new_tile = new Tile2({ size: new Size(tile.width(), tile.height())}, PICO8)
        sheet.getPropValue('tiles').push(new_tile)
        setTile(new_tile)
    }
    const dup_tile = () => {
        // const new_tile = tile.clone()
        // sheet.addSprite(new_tile)
        // setTile(new_tile)
    }
    const delete_tile = () => {
        // sheet.removeSprite(tile)
        // if(sheet.getImages().length > 0) {
        //     setTile(sheet.getImages()[0])
        // }
    }
    const export_bmp = () => {
        // const canvas = sheet_to_canvas(sheet)
        // const rawData = canvas_to_bmp(canvas, palette)
        // const blob = new Blob([rawData.data], {type:'image/bmp'})
        // forceDownloadBlob(`${sheet.getPropValue('name')}.bmp`,blob)
    }
    useEffect(() => {
        setTiles(sheet.getPropValue('tiles'))
        const hand = () => setTiles(sheet.getPropValue('tiles'))
        sheet.onAny(hand)
        return () => sheet.offAny(hand)
    }, [sheet])
    return <div className={'pane tile-list-view'}>
        <header>Tile Sheet</header>
        {/*{editable && <PropSheet target={sheet}/>}*/}
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
                  direction={ListViewDirection.HorizontalWrap}
                  style={{}}
        />
        {editable &&
        <div className={'toolbar'}>
            <button onClick={export_bmp}>to BMP</button>
        </div>}
    </div>
}
