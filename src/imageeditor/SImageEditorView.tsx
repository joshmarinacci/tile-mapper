import "./SImageEditorView.css"

import {Point} from "josh_js_util"
import React, {MouseEvent, useContext, useEffect, useRef, useState} from "react"

import {Icons, ImagePalette} from "../common/common"
import {DocContext, Icon, IconButton, Pane, ToggleButton} from "../common/common-components"
import {ListView, ListViewDirection, ListViewRenderer} from "../common/ListView"
import {PaletteColorPickerPane} from "../common/Palette"
import {PropSheet} from "../common/propsheet"
import {appendToList, useWatchAllProps, useWatchProp} from "../model/base"
import {SImage, SImageLayer} from "../model/datamodel"
import {GlobalState} from "../state"
import {EllipseTool, EllipseToolSettings} from "./ellipse_tool"
import {EraserTool, EraserToolSettings} from "./eraser_tool"
import {FillTool, FillToolSettings} from "./fill_tool"
import {LineTool, LineToolSettings} from "./line_tool"
import {PencilTool, PencilToolSettings} from "./pencil_tool"
import {RectTool, RectToolSettings} from "./rect_tool"
import {SelectionTool, SelectionToolSettings} from "./selection_tool"
import {Tool} from "./tool"

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

function clamp(val: number, min: number, max: number) {
    if (val < min) return min
    if (val > max) return max
    return val
}

function drawCanvas(canvas: HTMLCanvasElement, scale: number, grid: boolean, image: SImage, palette: ImagePalette, tool: Tool, drawColor:number) {
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
    ctx.fillStyle = 'magenta'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    image.getPropValue('layers').forEach(layer => {
        if (!layer.getPropValue('visible')) return
        ctx.save()
        ctx.globalAlpha = clamp(layer.getPropValue('opacity'), 0, 1)
        layer.getPropValue('data').forEach((n, p) => {
            ctx.fillStyle = palette.colors[n]
            if (n === -1) ctx.fillStyle = 'transparent'
            ctx.fillRect(p.x * scale, p.y * scale, 1 * scale, 1 * scale)
        })
        ctx.restore()
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
            color:drawColor,
            palette: palette,
        })
    }
}

export function SImageEditorView(props: {
    image: SImage,
    state: GlobalState
}) {
    const {image} = props
    const doc = useContext(DocContext)
    const palette = doc.getPropValue('palette')
    const [grid, setGrid] = useState(false)
    const [zoom, setZoom] = useState(3)
    const [drawColor, setDrawColor] = useState<string>(palette.colors[0])
    const [layer, setLayer] = useState<SImageLayer | undefined>(() => {
        if (image.getPropValue('layers').length > 0) {
            return image.getPropValue('layers')[0]
        } else {
            return undefined
        }
    })
    const canvasRef = useRef(null)
    const [tool, setTool] = useState<Tool>(() => new PencilTool())
    const [count, setCount] = useState(0)
    const size = image.getPropValue('size')

    const scale = Math.pow(2, zoom)
    const redraw = () => {
        if (canvasRef.current) {
            const scale = Math.pow(2, zoom)
            drawCanvas(canvasRef.current, scale, grid, image, palette, tool, palette.colors.indexOf(drawColor))
        }
    }

    useEffect(() => redraw(), [canvasRef, zoom, grid, count, image])
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

    let tool_settings = <div>no tool selected</div>
    if (tool instanceof PencilTool) tool_settings = <PencilToolSettings tool={tool}/>
    if (tool instanceof EraserTool) tool_settings = <EraserToolSettings tool={tool}/>
    if (tool instanceof RectTool) tool_settings = <RectToolSettings tool={tool}/>
    if (tool instanceof LineTool) tool_settings = <LineToolSettings tool={tool}/>
    if (tool instanceof EllipseTool) tool_settings = <EllipseToolSettings tool={tool}/>
    if (tool instanceof FillTool) tool_settings = <FillToolSettings tool={tool}/>
    if (tool instanceof SelectionTool) tool_settings = <SelectionToolSettings tool={tool}/>

    return <div className={'image-editor-view'}>
        <div className={'vbox'}>
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
                <IconButton onClick={() => setZoom(zoom + 1)}
                            icon={Icons.Plus}/>
                <IconButton onClick={() => setZoom(zoom - 1)}
                            icon={Icons.Minus}/>
                <ToggleButton onClick={() => setGrid(!grid)}
                              icon={Icons.Grid} selected={grid}
                              selectedIcon={Icons.GridSelected}/>
                <ToggleButton icon={Icons.Rect}
                              selected={tool.name === 'selection'}
                              onClick={() => setTool(new SelectionTool())}/>
                <ToggleButton icon={Icons.Pencil}
                              selected={tool.name === 'pencil'}
                              onClick={() => setTool(new PencilTool())}/>
                <ToggleButton icon={Icons.Eraser}
                              selected={tool.name === 'eraser'}
                              onClick={() => setTool(new EraserTool())}/>
                <ToggleButton onClick={() => setTool(new LineTool())}
                              icon={Icons.Line}
                              selected={tool.name === 'line'}/>
                <ToggleButton onClick={() => setTool(new RectTool())}
                              icon={Icons.Rect}
                              selected={tool.name === 'rect'}/>
                <ToggleButton onClick={() => setTool(new EllipseTool())}
                              icon={Icons.Ellipse}
                              selected={tool.name === 'ellipse'}/>
                <ToggleButton onClick={() => setTool(new FillTool())}
                              icon={Icons.PaintBucket}
                              selected={tool.name === 'fill'}
                />
            </div>
            <div className={'toolbar'}>
                <b>{tool.name} settings</b>
                {tool_settings}
            </div>
            <PaletteColorPickerPane drawColor={drawColor} setDrawColor={setDrawColor}
                                    palette={palette}/>
        </div>
        <div className={'image-editor-canvas-wrapper'}>
            <canvas ref={canvasRef} width={size.w * scale} height={size.h * scale}
                    onContextMenu={e => {
                        e.preventDefault()
                        e.stopPropagation()
                        const pt = canvasToImage(e)
                        if (layer) {
                            const color = layer.getPixel(pt)
                            setDrawColor(palette.colors[color])
                        }
                    }}
                    onMouseDown={(e) => {
                        if (e.button == 2) return
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
    </div>
}
