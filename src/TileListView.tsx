import "./TileSheetView.css"

import {toClass} from "josh_react_util"
import {forceDownloadBlob} from "josh_web_util"
import React, {useEffect, useRef} from "react"

import {useWatchProp} from "./base"
import {Sheet2, Tile2} from "./data2"
import {ListView, ListViewDirection, ListViewRenderer} from "./ListView"
import {canvas_to_bmp, drawEditableSprite, ImagePalette, PICO8, sheet_to_canvas} from "./model"

const TilePreviewRenderer: ListViewRenderer<Tile2> = (props: { value: Tile2, selected: boolean, index: number }) => {
    const {selected, value, index} = props
    const scale = 4
    const ref = useRef<HTMLCanvasElement>(null)
    const redraw = () => {
        if (ref.current) {
            const canvas = ref.current
            const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
            ctx.fillStyle = 'red'
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            drawEditableSprite(ctx, 1, value)
        }
    }
    useEffect(() => redraw(), [value])
    useWatchProp(value,'data',() => redraw())
    useWatchProp(value,'name')
    return <div className={'tile-preview-wrapper'}>
        <canvas ref={ref} className={toClass({
            'tile-preview': true,
            selected: props.selected,
        })} style={{
            width: `${value.width() * scale}px`,
            height: `${value.height() * scale}px`,
        }}
                width={value.width()}
                height={value.height()}
        ></canvas>
        <b>{props.value.getPropValue('name')}</b>
    </div>
}


export function TileListView(props: {
    sheet: Sheet2,
    tile: Tile2 | null,
    setTile: (tile: Tile2) => void,
    palette: ImagePalette,
    editable: boolean,
}) {
    const {sheet, tile, setTile, palette, editable} = props
    const tiles = sheet.getPropValue('tiles')
    const add_tile = () => {
        const size = sheet.getPropValue('tileSize')
        const tile = new Tile2({size: size}, PICO8)
        sheet.addTile(tile)
        setTile(tile)
    }
    const dup_tile = () => {
        if (!tile) return
        const new_tile = tile.clone()
        sheet.addTile(new_tile)
        setTile(new_tile)
    }
    const delete_tile = () => {
        if (tile) sheet.removeTile(tile)
        if (sheet.getPropValue('tiles').length > 0) {
            setTile(sheet.getPropValue('tiles')[0])
        } else {
            setTile(null)
        }
    }
    const export_bmp = () => {
        const canvas = sheet_to_canvas(sheet)
        const rawData = canvas_to_bmp(canvas, palette)
        const blob = new Blob([rawData.data], {type:'image/bmp'})
        forceDownloadBlob(`${sheet.getPropValue('name')}.bmp`,blob)
    }
    useWatchProp(sheet, 'tiles')
    return <div className={'pane tile-list-view'}>
        <header>Tile Sheet</header>
        {editable &&
            <div className={'toolbar'}>
                <button onClick={add_tile}>add tile</button>
                <button onClick={dup_tile}>dup tile</button>
                <button onClick={delete_tile}>del tile</button>
            </div>}
        <ListView className={'tile-list'}
                  selected={tile}
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
