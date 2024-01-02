import { Size } from "josh_js_util"
import { canvas_to_blob, forceDownloadBlob } from "josh_web_util"

import { Icons } from "../common/icons"
import { appendToList, PropsBase, removeFromList } from "../model/base"
import { GameDoc } from "../model/gamedoc"
import { ActorLayer, ColorMapLayer, GameMap, MapLayerType, TileLayer } from "../model/gamemap"
import { GlobalState } from "../state"
import { SimpleMenuAction } from "./actions"

export function map_to_canvas(map: GameMap, doc: GameDoc, scale: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas")
  const mapSize = map.calcBiggestLayer()
  const size = doc.getPropValue("tileSize")
  canvas.width = mapSize.w * scale * size.w
  canvas.height = mapSize.h * scale * size.h
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D
  ctx.imageSmoothingEnabled = false
  map.getPropValue("layers").forEach((layer) => {
    if (layer instanceof TileLayer) {
      const cells = layer.getPropValue("data")
      cells.forEach((v, n) => {
        if (v) {
          const x = n.x * size.w * scale
          const y = n.y * size.w * scale
          const can = doc.lookup_canvas(v.tile)
          if (can) {
            ctx.drawImage(
              can,
              //src
              0,
              0,
              can.width,
              can.height,
              //dst
              x,
              y,
              size.w * scale,
              size.h * scale,
            )
          }
        }
      })
    }
  })
  return canvas
}

const add_tile_layer = (map: GameMap) => {
  const layer = new TileLayer({
    name: "new tile layer",
    size: new Size(20, 10),
    scrollSpeed: 1,
    visible: true,
    wrapping: false,
  })
  appendToList(map, "layers", layer)
}
const add_actor_layer = (map: GameMap) => {
  const layer = new ActorLayer({
    name: "new actor layer",
    visible: true,
    blocking: true,
  })
  appendToList(map, "layers", layer)
}
const add_color_layer = (map: GameMap) => {
  const layer = new ColorMapLayer({
    name: "new color layer",
    visible: true,
    blocking: true,
    color: "red",
  })
  appendToList(map, "layers", layer)
}
const delete_map_layer = (layer: PropsBase<MapLayerType> | undefined, map: GameMap) => {
  if (!layer) return
  let layers = map.getPropValue("layers") as PropsBase<MapLayerType>[]
  layers = layers.slice()
  const n = layers.indexOf(layer)
  if (n >= 0) {
    layers.splice(n, 1)
  }
  map.setPropValue("layers", layers)
}
export const DeleteMapLayerAction: SimpleMenuAction = {
  type: "simple",
  title: "delete tile layer",
  icon: Icons.Trashcan,
  perform: async (state) => {
    const path = state.getSelectionPath()
    if (path.start() instanceof TileLayer || path.start() instanceof ActorLayer) {
      const map: GameMap = path.parent().start()
      delete_map_layer(path.start() as PropsBase<MapLayerType>, map)
    }
  },
}
const move_layer_up = (layer: PropsBase<MapLayerType> | undefined, map: GameMap) => {
  console.log("moving layer up")
  if (!layer) return
  let layers = map.getPropValue("layers") as PropsBase<MapLayerType>[]
  layers = layers.slice()
  const n = layers.indexOf(layer)
  if (n >= layers.length) return
  layers.splice(n, 1)
  layers.splice(n + 1, 0, layer)
  map.setPropValue("layers", layers)
}
export const MoveMapLayerUpAction: SimpleMenuAction = {
  type: "simple",
  title: "move layer up",
  icon: Icons.UpArrow,
  perform: async (state) => {
    const path = state.getSelectionPath()
    if (
      path.start() instanceof TileLayer ||
      path.start() instanceof ActorLayer ||
      path.start() instanceof ColorMapLayer
    ) {
      const map: GameMap = path.parent().start()
      move_layer_up(path.start() as PropsBase<MapLayerType>, map)
    }
  },
}
const move_layer_down = (layer: PropsBase<MapLayerType> | undefined, map: GameMap) => {
  if (!layer) return
  let layers = map.getPropValue("layers") as PropsBase<MapLayerType>[]
  layers = layers.slice()
  const n = layers.indexOf(layer)
  if (n <= 0) return
  layers.splice(n, 1)
  layers.splice(n - 1, 0, layer)
  map.setPropValue("layers", layers)
}
export const MoveMapLayerDownAction: SimpleMenuAction = {
  type: "simple",
  title: "move layer down",
  icon: Icons.DownArrow,
  perform: async (state) => {
    const path = state.getSelectionPath()
    if (
      path.start() instanceof TileLayer ||
      path.start() instanceof ActorLayer ||
      path.start() instanceof ColorMapLayer
    ) {
      const map: GameMap = path.parent().start()
      move_layer_down(path.start() as PropsBase<MapLayerType>, map)
    }
  },
}
export const DeleteMapAction: SimpleMenuAction = {
  type: "simple",
  title: "delete map",
  icon: Icons.Trashcan,
  perform: async (state) => {
    const sel = state.getPropValue("selection")
    if (sel instanceof GameMap) {
      removeFromList(state.getPropValue("doc"), "maps", sel as GameMap)
      state.clearSelection()
    }
  },
}

export async function exportMapToPNG(doc: GameDoc, map: GameMap, scale: number) {
  const can = map_to_canvas(map, doc, scale)
  const blob = await canvas_to_blob(can)
  forceDownloadBlob(`${map.getPropValue("name") as string}.${scale}x.png`, blob)
}
export const ExportMapToPNGAction: SimpleMenuAction = {
  type: "simple",
  title: "export map to PNG",
  icon: Icons.Download,
  perform: async (state: GlobalState) => {
    const doc = state.getPropValue("doc")
    const map: GameMap = state.getPropValue("selection")
    await exportMapToPNG(doc, map, 1)
  },
}

export const AddTileLayerToMapAction: SimpleMenuAction = {
  type: "simple",
  icon: Icons.Plus,
  title: "add tile layer",
  perform: async (state) => {
    const path = state.getSelectionPath()
    if (path.start() instanceof GameMap) {
      const map = path.start() as GameMap
      add_tile_layer(map)
    }
    if (path.start() instanceof TileLayer) {
      const map = path.parent().start() as GameMap
      add_tile_layer(map)
    }
    if (path.start() instanceof ActorLayer) {
      const map = path.parent().start() as GameMap
      add_tile_layer(map)
    }
  },
}
export const AddActorLayerToMapAction: SimpleMenuAction = {
  type: "simple",
  icon: Icons.Plus,
  title: "add actor layer",
  perform: async (state) => {
    const path = state.getSelectionPath()
    if (path.start() instanceof GameMap) {
      const map = path.start() as GameMap
      add_actor_layer(map)
    }
    if (path.start() instanceof TileLayer) {
      const map = path.parent().start() as GameMap
      add_actor_layer(map)
    }
    if (path.start() instanceof ActorLayer) {
      const map = path.parent().start() as GameMap
      add_actor_layer(map)
    }
  },
}

export const AddColorLayerToMapAction: SimpleMenuAction = {
  type: "simple",
  icon: Icons.Plus,
  title: "add color layer",
  perform: async (state) => {
    const path = state.getSelectionPath()
    if (path.start() instanceof GameMap) {
      const map = path.start() as GameMap
      add_color_layer(map)
    }
    if (path.start() instanceof TileLayer) {
      const map = path.parent().start() as GameMap
      add_color_layer(map)
    }
    if (path.start() instanceof ActorLayer) {
      const map = path.parent().start() as GameMap
      add_color_layer(map)
    }
  },
}
