import { ArrayGrid } from "josh_js_util"
import {
  Actor,
  ActorLayer as ACL,
  Canvas,
  RIGHT,
  TilemapLayer,
  TileReference,
} from "retrogami-engine"

import { GameState } from "../engine/gamestate"
import { drawImage } from "../imageeditor/drawing"
import { findActorForInstance } from "../mapeditor/ActorEditor"
import { MapCell } from "../model/datamodel"
import { GameDoc } from "../model/gamedoc"
import { ActorLayer, GameMap, TileLayer } from "../model/gamemap"

export function generateGamestate(
  current: HTMLCanvasElement,
  doc: GameDoc,
  map: GameMap,
): GameState {
  const gamestate = new GameState(current, doc)
  // pre-cache all of the tiles
  doc.getPropValue("sheets").forEach((sht) => {
    sht.getPropValue("tiles").forEach((tile) => {
      const can = doc.lookup_canvas(tile.getUUID())
      if (can) {
        gamestate.tileCache.addCachedTile(tile.getPropValue("name"), tile.getUUID(), {
          name: tile.getPropValue("name"),
          id: tile.getUUID(),
          blocking: tile.getPropValue("blocking"),
          canvas: can as Canvas,
        })
      }
    })
  })
  doc.getPropValue("canvases").forEach((img) => {
    const canvas = document.createElement("canvas")
    canvas.width = img.getPropValue("size").w
    canvas.height = img.getPropValue("size").h
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D
    drawImage(doc, ctx, img, doc.getPropValue("palette"), 1, img.frames()[0])
    gamestate.imageCache.addImage(img.getPropValue("name"), img.getUUID(), canvas as Canvas)
  })
  // turn each layer of the map into a layer of the engine
  map.getPropValue("layers").forEach((layer) => {
    if (layer instanceof TileLayer) {
      const tl = new TilemapLayer()
      tl.type = "tilemap"
      tl.name = layer.getPropValue("name")
      tl.blocking = layer.getPropValue("blocking")
      tl.wrapping = layer.getPropValue("wrapping")
      tl.scrollSpeed = layer.getPropValue("scrollSpeed")
      const size = layer.getPropValue("size")
      tl.tiles = new ArrayGrid<TileReference>(size.w, size.h)
      const editorCells = layer.getPropValue("data") as ArrayGrid<MapCell>
      tl.tiles.fill((n) => {
        if (editorCells.get(n)) return { uuid: editorCells.get(n).tile }
        return { uuid: "unknown" }
      })
      gamestate.addLayer(tl)
    }
    if (layer instanceof ActorLayer) {
      const actors = new ACL()
      actors.blocking = true
      gamestate.addLayer(actors)
      layer.getPropValue("actors").forEach((inst) => {
        const real_actor = findActorForInstance(inst, doc)
        if (real_actor) {
          const pos = inst.getPropValue("position")
          const val: Actor = {
            bounds: real_actor.getPropValue("viewbox").add(pos),
            hidden: false,
            type: real_actor.getPropValue("kind"),
            color: "blue",
            tile: {
              uuid: real_actor.getPropValue("sprite") as string,
            },
            name: real_actor.getPropValue("name"),
            hitable: true,
            vy: 0,
            vx: 0,
            standing: false,
            dir: RIGHT,
            opacity: 1.0,
            originalPosition: pos,
            actions: real_actor.getPropValue("actions"),
          }
          actors.addActor(val)
        }
      })
    }
  })
  return gamestate
}
