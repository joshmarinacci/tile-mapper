import "./MapEditor.css"

import { Point } from "josh_js_util"
import { DialogContext, Spacer } from "josh_react_util"
import React, { MouseEvent, useContext, useEffect, useRef, useState } from "react"

import { exportMapToPNG } from "../actions/actions"
import { DropdownButton, IconButton, ToggleButton } from "../common/common-components"
import { Icons } from "../common/icons"
import { ICON_CACHE } from "../iconcache"
import { PropsBase, useWatchAllProps, useWatchProp } from "../model/base"
import { DocContext } from "../model/contexts"
import { ActorInstance, ActorLayer, GameMap, MapLayerType, TileLayer } from "../model/gamemap"
import { Tile } from "../model/tile"
import { PlayTest } from "../preview/PlayTest"
import { ActorLayerMouseHandler, ActorLayerToolbar, drawActorlayer } from "./ActorEditor"
import { MouseHandler } from "./editorbase"
import { drawTileLayer, TileLayerMouseHandler, TileLayerToolbar } from "./TileEditor"

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

  const [zoom, setZoom] = useState(2)
  const scale = Math.pow(2, zoom)
  const biggest = map.calcBiggestLayer()
  const tileSize = doc.getPropValue("tileSize")
  useWatchProp(map, "layers")
  useEffect(() => {
    if (props.layer instanceof TileLayer) setHandler(new TileLayerMouseHandler())
    if (props.layer instanceof ActorLayer) setHandler(new ActorLayerMouseHandler())
  }, [props.layer])
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
          drawTileLayer(ctx, doc, layer as TileLayer, scale, grid)
        }
        if (layer instanceof ActorLayer) {
          drawActorlayer(ctx, doc, layer as ActorLayer, scale)
        }
      })
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
  const [fillOnce, setFillOnce] = useState<boolean>(false)
  const dm = useContext(DialogContext)
  const start_playing = () => {
    dm.show(<PlayTest map={map} />)
  }

  useEffect(() => redraw(), [zoom, layer])
  const onMouseDown = (e: MouseEvent<HTMLCanvasElement>) => {
    setDown(true)
    if (handler)
      handler.onMouseDown({
        e,
        layer,
        pt: canvasToLayer(e),
        doc,
        tile,
        setSelectedTile,
        selectedActor,
        setSelectedActor,
        fillOnce,
        setFillOnce,
      })
    redraw()
  }
  const onMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
    if (down) {
      if (handler)
        handler.onMouseMove({
          e,
          layer,
          pt: canvasToLayer(e),
          doc,
          tile,
          setSelectedTile,
          selectedActor,
          setSelectedActor,
          fillOnce,
          setFillOnce,
        })
      redraw()
    }
  }
  const onMouseUp = (e: MouseEvent<HTMLCanvasElement>) => {
    setDown(false)
    if (handler)
      handler.onMouseUp({
        e,
        layer,
        pt: canvasToLayer(e),
        doc,
        tile,
        setSelectedTile,
        selectedActor,
        setSelectedActor,
        fillOnce,
        setFillOnce,
      })
  }
  if (!layer) return <div>select a map</div>
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
        <TileLayerToolbar layer={layer} fillOnce={fillOnce} setFillOnce={setFillOnce} />
      )}
      {layer instanceof ActorLayer && (
        <ActorLayerToolbar layer={layer} onSelect={setSelectedActor} />
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
