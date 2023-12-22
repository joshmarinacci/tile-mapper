import React, { useContext, useEffect, useRef, useState } from "react"
import { ViewportDebugOverlay } from "retrogami-engine"

import { useWatchAllProps } from "./model/base"
import { Camera } from "./model/camera"
import { DocContext } from "./model/contexts"
import { GameMap } from "./model/gamemap"
import { generateGamestate } from "./preview/generateGamestate"

export function CameraEditorView(props: { camera: Camera }) {
  // const [anim] = useState(() => new Anim())
  const doc = useContext(DocContext)
  const ref = useRef<HTMLCanvasElement>(null)
  function redraw() {
    if (!ref.current) return
    // const map = new GameMap({ name: "scratch" })
    // const gameState = generateGamestate(ref.current, doc, map)
    // gameState.addLayer(new ViewportDebugOverlay())
    // anim.setGamestate(gameState)
    // anim.setZoom(5)
    // anim.drawOnce()
  }
  useWatchAllProps(props.camera, () => redraw())
  useEffect(() => redraw(), [props.camera])
  return (
    <>
      <div className={"vbox tool-column"}>camer tools</div>
      <div className={"editor-view"}>
        <canvas
          ref={ref}
          tabIndex={0}
          width={640}
          height={480}
          style={{
            alignSelf: "start",
          }}
        ></canvas>
      </div>
    </>
  )
}
