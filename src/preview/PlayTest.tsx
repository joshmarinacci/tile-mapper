import { DialogContext } from "josh_react_util"
import React, { useContext, useEffect, useRef, useState } from "react"
import { PhysicsConstants, ViewportDebugOverlay } from "retrogami-engine"

import { ToggleButton } from "../common/common-components"
import { Icons } from "../common/icons"
import { useWatchAllProps } from "../model/base"
import { DocContext } from "../model/contexts"
import { GameMap } from "../model/gamemap"
import { PropSheet } from "../propsheet/propsheet"
import { ActorDebugOverlay } from "./ActorDebugLayer"
import { Anim } from "./Anim"
import { generateGamestate } from "./generateGamestate"
import { GridDebugOverlay } from "./GridDebugOverlay"

export function PlayTest(props: { map: GameMap }) {
  const { map } = props
  const doc = useContext(DocContext)
  const tileSize = doc.getPropValue("tileSize")
  const camera = doc.getPropValue("camera")
  const physics = doc.getPropValue("physics")
  const ref = useRef<HTMLCanvasElement>(null)
  const [anim] = useState(() => new Anim())
  const [playing, setPlaying] = useState(true)
  const [showGrid, setShowGrid] = useState(true)
  const [showViewport, setShowViewport] = useState(true)
  const [showActors, setShowActors] = useState(true)
  const [showHidden, setShowHidden] = useState(true)
  const [showPhysics, setShowPhysics] = useState(true)
  const [zoom, setZoom] = useState(3)

  const redraw = () => {
    if (!ref.current) return
    const gameState = generateGamestate(ref.current, doc, map)
    if (showActors) gameState.addLayer(new ActorDebugOverlay(gameState))
    if (showViewport) gameState.addLayer(new ViewportDebugOverlay())
    if (showGrid) gameState.addLayer(new GridDebugOverlay(gameState))
    if (showPhysics) gameState.addLayer(gameState.getPhysics())

    anim.setGamestate(gameState)
    const phs: PhysicsConstants = {
      gravity: physics.getPropValue("gravity"),
      jump_power: physics.getPropValue("jump_power"),
      move_speed: physics.getPropValue("move_speed"),
      move_speed_max: physics.getPropValue("move_speed_max"),
      friction: physics.getPropValue("friction"),
    }
    anim.setPhysicsConstants(phs)
    anim.setKeyboardTarget(ref.current)
    anim.setZoom(zoom)
    anim.drawOnce()
  }
  // useWatchAllProps(test, () => redraw())
  useEffect(
    () => redraw(),
    [doc, zoom, showGrid, showViewport, showHidden, showActors, ref, showPhysics],
  )
  useWatchAllProps(camera, () => redraw())
  useWatchAllProps(physics, () => redraw())
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
      <section className={"vbox"}>
        <div className={"toolbar"}>
          <button onClick={() => setZoom(zoom + 1)}>zoom in</button>
          <label>{zoom}</label>
          <button onClick={() => setZoom(zoom - 1)}>zoom out</button>
        </div>
        <div className={"toolbar"}>
          <label>Debug</label>
          <ToggleButton
            onClick={() => setShowGrid(!showGrid)}
            selected={showGrid}
            icon={Icons.Grid}
            selectedIcon={Icons.GridSelected}
            text={"grid"}
          />
          <ToggleButton
            onClick={() => setShowPhysics(!showPhysics)}
            selected={showPhysics}
            icon={Icons.Grid}
            selectedIcon={Icons.GridSelected}
            text={"physics"}
          />
          <ToggleButton
            onClick={() => setShowViewport(!showViewport)}
            selected={showViewport}
            icon={Icons.Grid}
            selectedIcon={Icons.GridSelected}
            text={"viewport"}
          />
          <ToggleButton
            onClick={() => setShowActors(!showActors)}
            selected={showActors}
            icon={Icons.Grid}
            selectedIcon={Icons.GridSelected}
            text={"actors"}
          />
          <ToggleButton
            onClick={() => setShowHidden(!showHidden)}
            selected={showHidden}
            icon={Icons.Grid}
            selectedIcon={Icons.GridSelected}
            text={"hidden"}
          />
        </div>
        <div className={"hbox"}>
          <canvas
            ref={ref}
            tabIndex={0}
            width={viewport.w * tileSize.w * zoom}
            height={viewport.h * tileSize.h * zoom}
            style={{
              alignSelf: "start",
            }}
          ></canvas>
          <div
            className={"vbox"}
            style={{
              overflow: "clip",
            }}
          >
            <PropSheet target={camera} collapsable={true} collapsed={true} title={"camera"} />
            <PropSheet target={physics} collapsable={true} collapsed={true} title={"physics"} />
          </div>
        </div>
      </section>
      <footer>
        <button onClick={dismiss}>dismiss</button>
      </footer>
    </div>
  )
}
