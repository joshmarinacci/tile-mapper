import { ArrayGrid } from "josh_js_util"
import { DialogContext } from "josh_react_util"
import React, { useContext, useEffect, useRef, useState } from "react"
import {
  ActorLayer as ACL,
  PhysicsConstants,
  Player,
  RIGHT,
  TilemapLayer,
  TileReference,
} from "retrogami-engine"

import { drawGrid } from "../actions/actions"
import { GameState } from "../engine/gamestate"
import { drawImage } from "../imageeditor/ImageEditorView"
import { findActorForInstance } from "../mapeditor/ActorEditor"
import { DocContext } from "../model/contexts"
import { ActorLayer, GameMap, MapCell, TileLayer } from "../model/datamodel"
import { GameDoc } from "../model/gamedoc"
import { ActorDebugOverlay } from "../preview/ActorDebugLayer"
import { GridDebugOverlay } from "../preview/GridDebugOverlay"
import { ViewportDebugOverlay } from "../preview/ViewportDebugOverlay"
import { Anim } from "./Anim"

function generateGamestate(
  current: HTMLCanvasElement,
  doc: GameDoc,
  map: GameMap,
  physicsDebug: boolean,
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
  if (physicsDebug) gamestate.addLayer(gamestate.getPhysics())
  gamestate.addLayer(new ActorDebugOverlay(gamestate))
  gamestate.addLayer(new ViewportDebugOverlay(gamestate))
  gamestate.addLayer(new GridDebugOverlay(gamestate))
  return gamestate
}

export function PlayTest(props: { map: GameMap }) {
  const { map } = props
  const doc = useContext(DocContext)
  const tileSize = doc.getPropValue("tileSize")
  const camera = doc.getPropValue("camera")
  const ref = useRef<HTMLCanvasElement>(null)
  const [anim] = useState(() => new Anim())
  const [playing, setPlaying] = useState(true)

  const physicsDebug = true

  const zoom = 5
  const grid = true

  const redraw = () => {
    if (!ref.current) return
    anim.setGamestate(generateGamestate(ref.current, doc, map, physicsDebug))
    const phs: PhysicsConstants = {
      // gravity: test.getPropValue("gravity"),
      gravity: 0.15,
      // jump_power: test.getPropValue("jump_power"),
      jump_power: -2.0,
      // move_speed: test.getPropValue("move_speed"),
      move_speed: 0.08,

      // move_speed_max: test.getPropValue("move_speed_max"),
      move_speed_max: 1.5,
      // friction: test.getPropValue("friction"),
      friction: 0.98,
    }
    anim.setPhysicsConstants(phs)
    anim.setKeyboardTarget(ref.current)
    anim.setZoom(zoom)
    anim.drawOnce()
    const dpi = window.devicePixelRatio
    if (grid) {
      drawGrid(ref.current, zoom * dpi, tileSize, camera)
    }
  }
  // useWatchAllProps(test, () => redraw())
  useEffect(() => redraw(), [doc, zoom, grid, ref, physicsDebug])
  useEffect(() => {
    if (playing) {
      anim.stop()
      anim.play()
    } else {
      anim.stop()
    }
  }, [playing])
  const dm = useContext(DialogContext)
  const dismiss = () => {
    setPlaying(false)
    dm.hide()
  }
  const viewport = camera.getPropValue("viewport")
  return (
    <div
      className={"dialog"}
      style={{
        maxWidth: "80vw",
        minWidth: "80vw",
        maxHeight: "80vh",
        minHeight: "80vh",
      }}
    >
      <header>Play test</header>
      <section>
        <canvas
          ref={ref}
          tabIndex={0}
          width={(viewport.w + 5) * tileSize.w * zoom}
          height={(viewport.h + 5) * tileSize.h * zoom}
        ></canvas>
      </section>
      <footer>
        <button onClick={dismiss}>dismiss</button>
      </footer>
    </div>
  )
}
