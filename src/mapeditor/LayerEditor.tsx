import "./MapEditor.css"

import { Point } from "josh_js_util"
import { Spacer } from "josh_react_util"
import React, {
  MouseEvent,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react"

import { exportPNG } from "../actions/actions"
import { DocContext } from "../common/common-components"
import { ICON_CACHE } from "../iconcache"
import { PropsBase, useWatchAllProps, useWatchProp } from "../model/base"
import {
  ActorInstance,
  ActorLayer,
  GameMap,
  MapLayerType,
  Tile,
  TileLayer,
} from "../model/datamodel"
import {
  ActorLayerMouseHandler,
  ActorLayerToolbar,
  drawActorlayer,
} from "./ActorEditor"
import { MouseHandler } from "./editorbase"
import {
  drawTileLayer,
  TileLayerMouseHandler,
  TileLayerToolbar,
} from "./TileEditor"

export function LayerEditor(props: {
  map: GameMap
  layer: PropsBase<MapLayerType> | undefined
  tile: Tile | undefined
  setSelectedTile: (sprite: Tile) => void
}) {
  const { map, layer, tile, setSelectedTile } = props
  const doc = useContext(DocContext)
  const [grid, setGrid] = useState<boolean>(false)
  const [selectedActor, setSelectedActor] = useState<ActorInstance | undefined>(
    undefined,
  )
  const ref = useRef<HTMLCanvasElement>(null)
  const [down, setDown] = useState<boolean>(false)
  const [handler, setHandler] = useState<MouseHandler<unknown> | undefined>(
    undefined,
  )
  useEffect(() => redraw(), [grid, layer, selectedActor])

  const [zoom, setZoom] = useState(2)
  const scale = Math.pow(2, zoom)
  const biggest = map.calcBiggestLayer()
  const tileSize = doc.getPropValue("tileSize")
  useWatchProp(map, "layers")
  useEffect(() => {
    if (props.layer instanceof TileLayer)
      setHandler(new TileLayerMouseHandler())
    if (props.layer instanceof ActorLayer)
      setHandler(new ActorLayerMouseHandler())
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
          drawActorlayer(ctx, doc, layer as ActorLayer, scale, grid)
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
    return new Point(e.clientX, e.clientY)
      .subtract(new Point(rect.left, rect.top))
      .scale(1 / scale)
  }
  const [fillOnce, setFillOnce] = useState<boolean>(false)

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
        <button onClick={() => setGrid(!grid)}>grid</button>
        <button onClick={() => setZoom(zoom + 1)}>+</button>
        <button onClick={() => setZoom(zoom - 1)}>-</button>
        <Spacer />
        <button onClick={() => exportPNG(doc, map, 1)}>png 1x</button>
        <button onClick={() => exportPNG(doc, map, 2)}>png 2x</button>
        <button onClick={() => exportPNG(doc, map, 4)}>png 4x</button>
      </div>
      {layer instanceof TileLayer && (
        <TileLayerToolbar
          layer={layer}
          fillOnce={fillOnce}
          setFillOnce={setFillOnce}
        />
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
