import { ArrayGrid } from "josh_js_util"
import { ActorLayer as ACL, Player, RIGHT, TilemapLayer, TileReference } from "retrogami-engine"

import { GameState } from "../engine/gamestate"
import { drawImage } from "../imageeditor/ImageEditorView"
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
          canvas: can,
        })
      }
    })
  })
  doc.getPropValue("canvases").forEach((img) => {
    const canvas = document.createElement("canvas")
    canvas.width = img.getPropValue("size").w
    canvas.height = img.getPropValue("size").h
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D
    drawImage(doc, ctx, img, doc.getPropValue("palette"), 1)
    gamestate.imageCache.addImage(img.getPropValue("name"), img.getUUID(), canvas)
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
          const val: Player = {
            bounds: real_actor.getPropValue("viewbox").add(pos),
            hidden: false,
            type: "player",
            color: "blue",
            tile: {
              uuid: real_actor.getPropValue("sprite") as string,
            },
            name: inst.getPropValue("name"),
            hitable: true,
            vy: 0,
            vx: 0,
            standing: false,
            dir: RIGHT,
            opacity: 1.0,
            originalPosition: pos,
          }
          actors.addActor(val)
          if (real_actor.getPropValue("kind") === "player") {
            gamestate.addPlayer(val)
          }
        }
      })
    }
  })
  return gamestate
}
