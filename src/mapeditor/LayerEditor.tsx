import "./MapEditor.css"

import { Bounds, Point, Size } from "josh_js_util"
import { DialogContext, Spacer } from "josh_react_util"
import React, { MouseEvent, useContext, useEffect, useRef, useState } from "react"

import { exportMapToPNG } from "../actions/gamemap"
import { DropdownButton, IconButton, ToggleButton } from "../common/common-components"
import { Icons } from "../common/icons"
import { ICON_CACHE } from "../iconcache"
import { PropsBase, useWatchAllProps, useWatchProp } from "../model/base"
import { DocContext, ImageSnapshotContext, StateContext } from "../model/contexts"
import { GameDoc } from "../model/gamedoc"
import {
  ActorInstance,
  ActorLayer,
  ColorMapLayer,
  GameMap,
  MapLayerType,
  TileLayer,
} from "../model/gamemap"
import { Tile } from "../model/tile"
import { PlayTest } from "../preview/PlayTest"
import { strokeBounds } from "../util"
import { ActorLayerMouseHandler, ActorLayerToolbar, drawActorlayer } from "./ActorEditor"
import { MouseHandler } from "./editorbase"
import { ShareMapDialog } from "./ShareMapDialog"
import {
  drawColorLayer,
  drawTileLayer,
  TileLayerMouseHandler,
  TileLayerToolbar,
  TileLayerToolType,
} from "./TileEditor"

function drawGridLayer(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  doc: GameDoc,
  scale: number,
  grid: boolean,
  tileSize: Size,
) {
  ctx.strokeStyle = "#000000"
  ctx.lineWidth = 1.0
  // const size = camera.getPropValue("viewport").size()
  const size = new Size(canvas.width, canvas.height).scale(1 / scale).scale(tileSize.w)
  ctx.save()
  ctx.translate(0.5, 0.5)
  ctx.beginPath()
  for (let i = 0; i < size.w; i++) {
    ctx.moveTo(i * scale * tileSize.w, 0)
    ctx.lineTo(i * scale * tileSize.w, size.h * scale * tileSize.h)
  }
  for (let i = 0; i < size.h; i++) {
    ctx.moveTo(0, i * scale * tileSize.h)
    ctx.lineTo(size.w * scale * tileSize.h, i * scale * tileSize.w)
  }
  ctx.stroke()

  /*
  ctx.beginPath()
  ctx.lineWidth = 3.0
  const mx = new Point(size.w / 2, size.h / 2).floor()
  ctx.moveTo(mx.x * scale * tileSize.w, 0)
  ctx.lineTo(mx.x * scale * tileSize.w, size.h * scale * tileSize.h)
  ctx.moveTo(0, mx.y * scale * tileSize.h)
  ctx.lineTo(size.w * scale * tileSize.h, mx.x * scale * tileSize.h)
  ctx.stroke()
   */
  ctx.restore()
}

function drawTileLayerBounds(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  doc: GameDoc,
  selectedLayer1: TileLayer,
  scale: number,
) {
  const size = selectedLayer1.getPropValue("size")
  const tilesize = doc.getPropValue("tileSize")
  const fsize = size.scale(tilesize.w).scale(scale)
  strokeBounds(ctx, Bounds.fromPointSize(new Point(0, 0), fsize), "orange", 5)
  strokeBounds(ctx, Bounds.fromPointSize(new Point(0, 0), fsize), "white", 1)
}

export function LayerEditor(props: {
  map: GameMap
  layer: PropsBase<MapLayerType> | undefined
  tile: Tile | undefined
  setSelectedTile: (sprite: Tile) => void
}) {
  const { map, layer, tile, setSelectedTile } = props
  const doc = useContext(DocContext)
  const [grid, setGrid] = useState<boolean>(false)
  const [selectedActor, setSelectedActor] = useState<ActorInstance | undefined>(undefined)
  const ref = useRef<HTMLCanvasElement>(null)
  const [down, setDown] = useState<boolean>(false)
  const [handler, setHandler] = useState<MouseHandler<unknown> | undefined>(undefined)
  useEffect(() => redraw(), [grid, layer, selectedActor])
  const [selectedTool, setSelectedTool] = useState<TileLayerToolType>("pencil")

  const [zoom, setZoom] = useState(2)
  const scale = Math.pow(2, zoom)
  const biggest = map.calcBiggestLayer()
  const tileSize = doc.getPropValue("tileSize")
  useWatchProp(map, "layers")
  useEffect(() => {
    if (props.layer instanceof TileLayer) setHandler(new TileLayerMouseHandler())
    if (props.layer instanceof ActorLayer) setHandler(new ActorLayerMouseHandler())
  }, [props.layer])
  const isc = useContext(ImageSnapshotContext)
  const redraw = () => {
    if (ref.current) {
      const canvas = ref.current
      const ctx = canvas.getContext("2d") as CanvasRenderingContext2D
      ctx.imageSmoothingEnabled = false
      ctx.fillStyle = ctx.createPattern(
        ICON_CACHE.getIconCanvas("checkerboard"),
        "repeat",
      ) as CanvasPattern
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      map.getPropValue("layers").forEach((layer: PropsBase<MapLayerType>) => {
        if (!layer.getPropValue("visible")) return
        if (layer instanceof TileLayer) {
          drawTileLayer(canvas, ctx, doc, layer as TileLayer, scale)
        }
        if (layer instanceof ActorLayer) {
          drawActorlayer(ctx, doc, layer as ActorLayer, scale, isc)
        }
        if (layer instanceof ColorMapLayer) {
          drawColorLayer(canvas, ctx, doc, layer as ColorMapLayer, scale)
        }
      })
      if (grid) {
        drawGridLayer(canvas, ctx, doc, scale, grid, tileSize)
      }
      if (layer instanceof TileLayer) {
        drawTileLayerBounds(canvas, ctx, doc, layer as TileLayer, scale)
      }
      if (handler)
        handler.drawOverlay({
          doc,
          layer,
          tile,
          ctx,
          grid,
          scale,
          selectedActor,
        })
    }
  }
  useWatchAllProps(map, () => redraw())
  const canvasToLayer = (e: MouseEvent<HTMLCanvasElement>) => {
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect()
    return new Point(e.clientX, e.clientY).subtract(new Point(rect.left, rect.top)).scale(1 / scale)
  }
  const dm = useContext(DialogContext)
  const start_playing = () => {
    dm.show(<PlayTest map={map} />)
  }

  useEffect(() => redraw(), [zoom, layer])
  const state = useContext(StateContext)
  const make_event = (e: MouseEvent<HTMLCanvasElement>) => {
    return {
      e,
      pt: canvasToLayer(e),
      doc,
      layer,
      tile,
      setSelectedTile,
      selectedActor,
      setSelectedActor: (act: ActorInstance | undefined) => {
        setSelectedActor(act)
        // state.setSelectionTarget(act)
      },
      selectedTool,
      setSelectedTool,
    }
  }
  const onMouseDown = (e: MouseEvent<HTMLCanvasElement>) => {
    setDown(true)
    if (handler) handler.onMouseDown(make_event(e))
    redraw()
  }
  const onMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
    if (down) {
      if (handler) handler.onMouseMove(make_event(e))
      redraw()
    }
  }
  const onMouseUp = (e: MouseEvent<HTMLCanvasElement>) => {
    setDown(false)
    if (handler) handler.onMouseUp(make_event(e))
  }
  if (!layer) return <div>select a map</div>

  async function share_map() {
    dm.show(<ShareMapDialog />)
  }

  return (
    <div className={"layer-editor"}>
      <div className={"toolbar"}>
        <ToggleButton
          onClick={() => setGrid(!grid)}
          icon={Icons.Grid}
          selected={grid}
          selectedIcon={Icons.GridSelected}
          text={"grid"}
        />
        <IconButton onClick={() => setZoom(zoom + 1)} icon={Icons.Plus} tooltip={"zoom in"} />
        <IconButton onClick={() => setZoom(zoom - 1)} icon={Icons.Minus} tooltip={"zoom out"} />
        <Spacer />
        <IconButton
          onClick={start_playing}
          icon={Icons.Play}
          text={"run"}
          tooltip={"run game map in simulator"}
        />
        <IconButton onClick={share_map} icon={Icons.Play} text={"share"} tooltip={"share as url"} />
        <Spacer />
        <DropdownButton icon={Icons.Gear}>
          <IconButton
            onClick={() => exportMapToPNG(doc, map, 1)}
            icon={Icons.Download}
            text={"png 1x"}
            tooltip={"download entire map as 1x png"}
          />
          <IconButton
            onClick={() => exportMapToPNG(doc, map, 2)}
            icon={Icons.Download}
            text={"png 2x"}
            tooltip={"download entire map as 2x png"}
          />
          <IconButton
            onClick={() => exportMapToPNG(doc, map, 4)}
            icon={Icons.Download}
            text={"png 4x"}
            tooltip={"download entire map as 4x png"}
          />
        </DropdownButton>
      </div>
      {layer instanceof TileLayer && (
        <TileLayerToolbar
          layer={layer}
          setSelectedTool={setSelectedTool}
          selectedTool={selectedTool}
        />
      )}
      {layer instanceof ActorLayer && (
        <ActorLayerToolbar layer={layer} onSelect={setSelectedActor} selected={selectedActor} />
      )}
      <div className={"map-editor-canvas-wrapper"}>
        <canvas
          ref={ref}
          width={biggest.w * scale * tileSize.w}
          height={biggest.h * scale * tileSize.h}
          onContextMenu={(e) => e.preventDefault()}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
        />
      </div>
    </div>
  )
}
