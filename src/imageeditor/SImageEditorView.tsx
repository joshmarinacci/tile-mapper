import "./SImageEditorView.css"

import {Point} from "josh_js_util"
import React, {MouseEvent, useContext, useEffect, useRef, useState} from "react"

import {drawEllipse, drawRect} from "../actions/actions"
import {Icons, ImagePalette} from "../common/common"
import {DocContext, Icon, IconButton, Pane, ToggleButton} from "../common/common-components"
import {ListView, ListViewDirection, ListViewRenderer} from "../common/ListView"
import {PaletteColorPickerPane} from "../common/Palette"
import {PropSheet} from "../common/propsheet"
import {appendToList, useWatchAllProps, useWatchProp} from "../model/base"
import {SImage, SImageLayer} from "../model/datamodel"
import {GlobalState} from "../state"

/*

main view
 layer list side pane
 color picker from the current palette
 toolbar with the main tools for pen, pencil, shape drawing, and bucket.

put the actual drawing canvas and mouse handlers in a sub view
create a mouse handler interface for when we switch tools

tools for:
    line tool
    rect tool
    ellipse tool

mouse handler interface:
    mouse down, move, up all part of the same single function? what about overlays?
    currently selected color
    keyboard state of the mouse
    the selected layer and if it's visible
    the current mouse point is real screen coords and SImage coords

the drawing subview draws every layer in the image using visibility
    transparent background
    draw each visible layer
    draw an overlay for the currently selected tool


 */

type ToolEvent = {
    pt: Point, // in image coords
    e: React.MouseEvent<HTMLCanvasElement>, // in screen coords
    color: number, //currently selected color
    palette: ImagePalette,
    layer: SImageLayer | undefined, // currently selected layer
    markDirty: () => void
}
type ToolOverlayInfo = {
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    scale: number,
}

interface Tool {
    name: string,

    onMouseDown(evt: ToolEvent): void

    onMouseMove(evt: ToolEvent): void

    onMouseUp(evt: ToolEvent): void

    drawOverlay(ovr: ToolOverlayInfo): void
}

class PencilTool implements Tool {
    name: string
    private _down: boolean

    constructor() {
        this.name = 'pencil'
        this._down = false
    }

    drawOverlay(ovr: ToolOverlayInfo): void {
    }

    onMouseDown(evt: ToolEvent): void {
        this._down = true
        if (evt.layer) {
            evt.layer.setPixel(evt.pt, evt.color)
        }
    }

    onMouseMove(evt: ToolEvent): void {
        if (evt.layer && this._down) {
            evt.layer.setPixel(evt.pt, evt.color)
        }
    }

    onMouseUp(evt: ToolEvent): void {
        this._down = false
    }

}

class EraserTool implements Tool {
    name: string
    private _down: boolean

    constructor() {
        this.name = 'eraser'
        this._down = false
    }

    drawOverlay(ovr: ToolOverlayInfo): void {
    }

    onMouseDown(evt: ToolEvent): void {
        this._down = true
        if (evt.layer) {
            evt.layer.setPixel(evt.pt, evt.color)
        }
    }

    onMouseMove(evt: ToolEvent): void {
        if (evt.layer && this._down) {
            evt.layer.setPixel(evt.pt, evt.color)
        }
    }

    onMouseUp(evt: ToolEvent): void {
        this._down = false
    }

}

class LineTool implements Tool {
    name: string
    private _down: boolean
    private _start: Point
    private _current: Point

    constructor() {
        this.name = 'line'
        this._down = false
        this._start = new Point(0, 0)
        this._current = new Point(0, 0)
    }

    drawOverlay(ovr: ToolOverlayInfo): void {
        if (this._down) {
            ovr.ctx.strokeStyle = 'red'
            ovr.ctx.lineWidth = 5
            ovr.ctx.beginPath()
            ovr.ctx.moveTo(this._start.x * ovr.scale, this._start.y * ovr.scale)
            ovr.ctx.lineTo(this._current.x * ovr.scale, this._current.y * ovr.scale)
            ovr.ctx.stroke()
        }
    }

    onMouseDown(evt: ToolEvent): void {
        this._down = true
        this._start = evt.pt
        this._current = evt.pt
    }

    onMouseMove(evt: ToolEvent): void {
        if (this._down) {
            this._current = evt.pt
            evt.markDirty()
        }
    }

    onMouseUp(evt: ToolEvent): void {
        this._down = false
        if (evt.layer) {
            const x0 = this._start.x
            const y0 = this._start.y
            const x1 = this._current.x
            const y1 = this._current.y
            const dx = x1 - x0
            const dy = y1 - y0
            let D = 2 * dy - dx
            let y = y0
            for (let x = x0; x <= x1; x++) {
                evt.layer.setPixel(new Point(x, y), evt.color)
                if (D > 0) {
                    y = y + 1
                    D = D - 2 * dx
                }
                D = D + 2 * dy
            }
        }
        evt.markDirty()
    }

}

class RectTool implements Tool {
    name: string
    private down: boolean
    private start: Point
    private end: Point

    constructor() {
        this.name = 'rect'
        this.down = false
        this.start = new Point(0, 0)
        this.end = new Point(0, 0)
    }
    drawOverlay(ovr: ToolOverlayInfo): void {
        if (!this.down) return
        ovr.ctx.strokeStyle = 'red'
        ovr.ctx.lineWidth = 4
        ovr.ctx.beginPath()
        ovr.ctx.strokeRect(this.start.x * ovr.scale, this.start.y * ovr.scale, (this.end.x - this.start.x) * ovr.scale, (this.end.y - this.start.y) * ovr.scale)
    }
    onMouseDown(evt: ToolEvent): void {
        this.down = true
        this.start = evt.pt
        this.end = evt.pt
        evt.markDirty()
    }
    onMouseMove(evt: ToolEvent): void {
        if (this.down) {
            this.end = evt.pt
            evt.markDirty()
        }
    }
    onMouseUp(evt: ToolEvent): void {
        this.down = false
        if (evt.layer) {
            drawRect(evt.layer, evt.color, this.start, this.end)
        }
    }
}

class EllipseTool implements Tool {
    name: string
    private down: boolean
    private start: Point
    private end: Point
    constructor() {
        this.name = 'ellipse'
        this.down = false
        this.start = new Point(0, 0)
        this.end = new Point(0, 0)
    }
    drawOverlay(ovr: ToolOverlayInfo): void {
        if (!this.down) return
        ovr.ctx.strokeStyle = 'red'
        ovr.ctx.lineWidth = 4
        ovr.ctx.beginPath()
        const scale = ovr.scale
        const start = this.start
        const end = this.end
        const i1 = Math.min(start.x, end.x)
        const i2 = Math.max(start.x, end.x)
        const j1 = Math.min(start.y, end.y)
        const j2 = Math.max(start.y, end.y)
        ovr.ctx.moveTo(i1*scale,j1*scale)
        ovr.ctx.lineTo(i2*scale,j2*scale)
        ovr.ctx.ellipse(
            i1*scale,
            j1*scale,
            (i2-i1)*scale,
            (j2-j1)*scale,
            0,0, Math.PI*2)
        ovr.ctx.stroke()
    }
    onMouseDown(evt: ToolEvent): void {
        this.down = true
        this.start = evt.pt
        this.end = evt.pt
        evt.markDirty()
    }
    onMouseMove(evt: ToolEvent): void {
        if (this.down) {
            this.end = evt.pt
            evt.markDirty()
        }
    }
    onMouseUp(evt: ToolEvent): void {
        this.down = false
        if (evt.layer) {
            drawEllipse(evt.layer, evt.color, this.start, this.end)
        }
    }
}

class FillTool implements Tool {
    name: string

    constructor() {
        this.name = 'fill'
    }

    drawOverlay(ovr: ToolOverlayInfo): void {
    }

    onMouseDown(evt: ToolEvent): void {
    }

    onMouseMove(evt: ToolEvent): void {
    }

    onMouseUp(evt: ToolEvent): void {
    }

}

const LayerItemRenderer: ListViewRenderer<SImageLayer, never> = (props: {
    value: SImageLayer,
    selected: boolean,
    options: never,
}) => {
    const {value} = props
    useWatchProp(value, 'name')
    useWatchProp(value, 'visible')
    useWatchProp(value, 'opacity')
    return <div className={'std-list-item'} style={{justifyContent: 'space-between'}}>
        <b>{value.getPropValue('name')}</b>
        <i>{value.getPropValue('opacity').toFixed(2)}</i>
        <Icon
            onClick={() => value.setPropValue('visible', !value.getPropValue('visible'))}
            name={value.getPropValue('visible') ? Icons.EyeOpen : Icons.EyeClosed}/>
    </div>
}

function drawCanvas(canvas: HTMLCanvasElement, scale: number, grid: boolean, image: SImage, palette: ImagePalette, tool: Tool) {
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
    ctx.fillStyle = 'magenta'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    image.getPropValue('layers').forEach(layer => {
        if (!layer.getPropValue('visible')) return
        layer.getPropValue('data').forEach((n, p) => {
            ctx.fillStyle = palette.colors[n]
            ctx.fillRect(p.x * scale, p.y * scale, 1 * scale, 1 * scale)
        })
    })
    const size = image.getPropValue('size')
    if (grid) {
        ctx.strokeStyle = 'black'
        ctx.lineWidth = 0.5
        ctx.beginPath()
        for (let i = 0; i < size.w; i++) {
            ctx.moveTo(i * scale, 0)
            ctx.lineTo(i * scale, size.h * scale)
        }
        for (let j = 0; j < size.h; j++) {
            ctx.moveTo(0, j * scale)
            ctx.lineTo(size.w * scale, j * scale)
        }
        ctx.stroke()
    }
    if (tool) {
        tool.drawOverlay({
            canvas: canvas,
            ctx: ctx,
            scale: scale,
        })
    }
}

export function SImageEditorView(props: { image: SImage, state: GlobalState }) {
    const {image} = props
    const doc = useContext(DocContext)
    const palette = doc.getPropValue('palette')
    const [grid, setGrid] = useState(true)
    const [zoom, setZoom] = useState(0)
    const [drawColor, setDrawColor] = useState<string>(palette.colors[0])
    const [layer, setLayer] = useState<SImageLayer | undefined>()
    const canvasRef = useRef(null)
    const [tool, setTool] = useState<Tool>(() => new PencilTool())
    const [count, setCount] = useState(0)

    const scale = Math.pow(2, zoom)
    const redraw = () => {
        if (canvasRef.current) {
            const scale = Math.pow(2, zoom)
            drawCanvas(canvasRef.current, scale, grid, image, palette, tool)
        }
    }

    useEffect(() => redraw(), [canvasRef, zoom, grid, count])
    useWatchAllProps(image, () => setCount(count + 1))

    const canvasToImage = (e: MouseEvent<HTMLCanvasElement>) => {
        const rect = (e.target as HTMLCanvasElement).getBoundingClientRect()
        return new Point(e.clientX, e.clientY)
            .subtract(new Point(rect.left, rect.top))
            .scale(1 / scale)
            .floor()
    }
    const new_layer = () => {
        const layer = new SImageLayer({name: 'unknown layer', opacity: 1.0, visible: true})
        layer.rebuildFromCanvas(image)
        appendToList(image, 'layers', layer)
    }
    const del_layer = () => {
        if (!layer) return
        let layers = image.getPropValue('layers')
        layers = layers.slice()
        const n = layers.indexOf(layer)
        if (n >= 0) {
            layers.splice(n, 1)
        }
        image.setPropValue('layers', layers)
    }
    const move_layer_down = () => {
        if (!layer) return
        let layers = image.getPropValue('layers')
        layers = layers.slice()
        const n = layers.indexOf(layer)
        if (n >= layers.length) return
        layers.splice(n, 1)
        layers.splice(n + 1, 0, layer)
        image.setPropValue('layers', layers)
    }
    const move_layer_up = () => {
        if (!layer) return
        let layers = image.getPropValue('layers')
        layers = layers.slice()
        const n = layers.indexOf(layer)
        if (n <= 0) return
        layers.splice(n, 1)
        layers.splice(n - 1, 0, layer)
        image.setPropValue('layers', layers)
    }


    return <div className={'image-editor-view'}>
        <Pane key={'layer-list'} title={'layers'} collapsable={true}>
            <div className={'toolbar'}>
                <IconButton onClick={() => new_layer()} icon={Icons.Plus}/>
                <IconButton onClick={() => del_layer()} icon={Icons.Trashcan}/>
                <IconButton onClick={() => move_layer_down()} icon={Icons.UpArrow}/>
                <IconButton onClick={() => move_layer_up()} icon={Icons.DownArrow}/>
            </div>
            <ListView selected={layer} setSelected={setLayer}
                      renderer={LayerItemRenderer}
                      data={props.image.getPropValue('layers')}
                      direction={ListViewDirection.VerticalFill}
                      options={{}}/>
        </Pane>
        <PropSheet target={layer} title={'Layer Info'}/>
        <div className={'toolbar'}>
            <IconButton onClick={() => setZoom(zoom + 1)} icon={Icons.Plus}/>
            <IconButton onClick={() => setZoom(zoom - 1)} icon={Icons.Minus}/>
            <ToggleButton onClick={() => setGrid(!grid)} icon={Icons.Grid} selected={grid}
                          selectedIcon={Icons.GridSelected}/>
            <ToggleButton onClick={() => setTool(new PencilTool())} icon={Icons.Pencil}
                          selected={tool.name === 'pencil'}/>
            <ToggleButton onClick={() => setTool(new EraserTool())} icon={Icons.Eraser}
                          selected={tool.name === 'eraser'}/>
            <ToggleButton onClick={() => setTool(new LineTool())} icon={Icons.Line}
                          selected={tool.name === 'line'}/>
            <ToggleButton onClick={() => setTool(new RectTool())} icon={Icons.Rect}
                          selected={tool.name === 'rect'}/>
            <ToggleButton onClick={() => setTool(new EllipseTool())} icon={Icons.Ellipse}
                          selected={tool.name === 'ellipse'}/>
            <ToggleButton onClick={() => setTool(new FillTool())} icon={Icons.PaintBucket}
                          selected={tool.name === 'fill'}
            />
        </div>
        <PaletteColorPickerPane drawColor={drawColor} setDrawColor={setDrawColor}
                                palette={palette}/>
        <div className={'pixel-editor'}>main view</div>
        <canvas ref={canvasRef} width={512} height={512}
                onContextMenu={e => {
                    e.preventDefault()
                    e.stopPropagation()
                    const pt = canvasToImage(e)
                    if(layer) {
                        const color = layer.getPixel(pt)
                        setDrawColor(palette.colors[color])
                    }
                }}
                onMouseDown={(e) => {
                    if(e.button == 2) return
                    tool.onMouseDown({
                        color: palette.colors.indexOf(drawColor),
                        pt: canvasToImage(e),
                        e: e,
                        layer: layer,
                        palette: palette,
                        markDirty: () => {

                        }
                    })
                }}
                onMouseMove={(e) => {
                    tool.onMouseMove({
                        color: palette.colors.indexOf(drawColor),
                        pt: canvasToImage(e),
                        e: e,
                        layer: layer,
                        palette: palette,
                        markDirty: () => {
                            setCount(count + 1)
                        }
                    })
                }}
                onMouseUp={(e) => {
                    tool.onMouseUp({
                        color: palette.colors.indexOf(drawColor),
                        pt: canvasToImage(e),
                        e: e,
                        layer: layer,
                        palette: palette,
                        markDirty: () => {

                        }
                    })
                }}
        />
    </div>
}
