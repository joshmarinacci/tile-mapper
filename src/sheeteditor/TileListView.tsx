import "./TileSheetView.css"

import {Spacer, toClass} from "josh_react_util"
import React, {useContext, useEffect, useRef, useState} from "react"

import {
    deleteTile,
    duplicate_tile, export_bmp,
    flipTileAroundHorizontal,
    flipTileAroundVertical,
    rotateTile90Clock,
    rotateTile90CounterClock
} from "../actions/actions"
import {drawEditableSprite, ImagePalette} from "../common/common"
import {
    DocContext,
    DropdownButton,
    MenuList,
    Pane
} from "../common/common-components"
import {ListSelect} from "../common/ListSelect"
import {ListView, ListViewDirection, ListViewOptions, ListViewRenderer} from "../common/ListView"
import {PopupContext} from "../common/popup"
import {ICON_CACHE} from "../iconcache"
import {useWatchProp} from "../model/base"
import {Sheet, Tile} from "../model/datamodel"

type TilePreviewOptions = {
    sheet:Sheet,
    showNames:boolean,
    showGrid:boolean,
    scale:number
} & ListViewOptions

export const TilePreviewRenderer: ListViewRenderer<Tile, TilePreviewOptions> = (props: {
    value: Tile,
    selected: boolean,
    options: TilePreviewOptions
}) => {
    const {value, options, selected} = props
        const ref = useRef<HTMLCanvasElement>(null)
    const redraw = () => {
        if (ref.current && value) {
            const canvas = ref.current
            const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
            ctx.fillStyle = ctx.createPattern(ICON_CACHE.getIconCanvas('checkerboard'), 'repeat') as CanvasPattern
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            drawEditableSprite(ctx, 1, value)
        }
    }
    useEffect(() => redraw(), [value])
    useWatchProp(value, 'data', () => redraw())
    useWatchProp(value, 'name')
    const pm = useContext(PopupContext)
    const showPopup = (e:React.MouseEvent<HTMLElement>) => {
        e.preventDefault()
        e.stopPropagation()
        pm.show_at(<MenuList>
            <button onClick={()=>flipTileAroundVertical(value)}>flip left / right</button>
            <button onClick={()=>flipTileAroundHorizontal(value)}>flip top / bottom</button>
            <button onClick={()=>rotateTile90Clock(value)}>rotate 90 clock</button>
            <button onClick={()=>rotateTile90CounterClock(value)}>rotate 90 counter-clock</button>
            <button onClick={()=>duplicate_tile(options.sheet,value)}>duplicate</button>
            <button onClick={()=>deleteTile(options.sheet,value)}>delete</button>
        </MenuList>,e.target,"left")
    }
    return <div className={'tile-preview-wrapper'}
                onContextMenu={showPopup}>
        <canvas ref={ref}
                className={toClass({ 'tile-preview': true, selected, })}
                style={{
                    width: `${value.width() * options.scale}px`,
                    height: `${value.height() * options.scale}px`,
                    border: options.showGrid?'3px solid transparent':'0px solid transparent',
                }}
                width={value.width()}
                height={value.height()}
        ></canvas>
        {options.showNames && <b>{props.value.getPropValue('name')}</b>}
    </div>
}

const SheetPreviewRenderer: ListViewRenderer<Sheet, never> = (props: {
    value: Sheet,
    selected: boolean,
    options: ListViewOptions,
}) => {
    const {selected, value} = props
    return <div className={toClass({
        'std-dropdown-item': true,
        selected: selected,
    })}
    >
        <b>{value.getPropValue('name')}</b>
        <i>{value.getPropValue('tiles').length} tiles</i>
    </div>
}


export function TileListView(props: {
    sheet: Sheet,
    tile: Tile | undefined,
    setTile: (tile: Tile | undefined) => void,
    palette: ImagePalette,
    editable: boolean,
}) {
    const {sheet, tile, setTile, palette, editable} = props
    const [showNames, setShowNames] = useState(true)
    const [showGrid, setShowGrid] = useState(true)
    const [scale, setScale] = useState(4)
    const tiles = sheet.getPropValue('tiles')
    const add_tile = () => {
        const size = sheet.getPropValue('tileSize')
        const tile = new Tile({size: size, palette: palette})
        sheet.addTile(tile)
        setTile(tile)
    }
    const dup_tile = () => {
        if(tile)  setTile(duplicate_tile(sheet,tile))
    }
    const delete_tile = () => {
        if(tile) deleteTile(sheet,tile)
        if (sheet.getPropValue('tiles').length > 0) {
            setTile(sheet.getPropValue('tiles')[0])
        } else {
            setTile(undefined)
        }
    }
    useWatchProp(sheet, 'tiles')
    return <div className={'tile-list-view'}>
        {editable &&
            <div className={'toolbar'}>
                <button onClick={add_tile}>add tile</button>
                <button onClick={dup_tile}>dup tile</button>
                <button onClick={delete_tile}>del tile</button>
                <Spacer/>
                <DropdownButton title={'options'}>
                    <button onClick={() => setShowNames(!showNames)}>show names</button>
                    <button onClick={() => setShowGrid(!showGrid)}>show grid</button>
                    <button onClick={() => setScale(1)}>1x</button>
                    <button onClick={() => setScale(2)}>2x</button>
                    <button onClick={() => setScale(4)}>4x</button>
                    <button onClick={() => setScale(8)}>8x</button>
                    <button onClick={() => setScale(16)}>16x</button>
                </DropdownButton>
            </div>}
        <ListView className={'tile-list'}
                  selected={tile}
                  setSelected={setTile}
                  renderer={TilePreviewRenderer}
                  data={tiles}
                  options={{ showNames, scale, sheet, showGrid }}
                  direction={ListViewDirection.HorizontalWrap}
        />
        {editable &&
            <div className={'toolbar'}>
                <button onClick={()=>export_bmp(sheet,palette)}>to BMP</button>
            </div>}
    </div>
}

export function CompactSheetAndTileSelector(props: {
    selectedTile: Tile|undefined,
    setSelectedTile: (t: Tile|undefined) => void,
}) {
    const {selectedTile, setSelectedTile} = props
    const doc = useContext(DocContext)
    const sheets = doc.getPropValue('sheets')
    const [selectedSheet, setSelectedSheet] = useState<Sheet|undefined>(sheets[0])
    return <Pane header={
        <header>
            <label>Tile Sheet</label>
            <Spacer/>
            <ListSelect selected={selectedSheet}
                        renderer={SheetPreviewRenderer}
                        setSelected={setSelectedSheet}
                        data={sheets}
                        options={{}}
            />
        </header>
    }>
        {selectedSheet && <TileListView
            sheet={selectedSheet}
            tile={selectedTile}
            editable={false}
            setTile={t => setSelectedTile(t)}
            palette={doc.getPropValue('palette')}/>}
    </Pane>
}