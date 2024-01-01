import React, { useContext, useEffect, useRef, useState } from "react"

import { get_class_registry } from "./model"
import { useWatchAllProps } from "./model/base"
import { Camera } from "./model/camera"
import { DocContext } from "./model/contexts"
import { GamePlayer } from "./preview/GamePlayer"
import { ConsoleLogger } from "./util"

export function CameraEditorView(props: { camera: Camera }) {
  const doc = useContext(DocContext)
  const ref = useRef<HTMLCanvasElement>(null)
  const [player] = useState(() => new GamePlayer())
  const rebuild = () => {
    if (ref.current) {
      if (doc.getPropValue("sheets").length < 1) {
        console.log("no sheets")
        return
      }
      if (doc.getPropValue("maps").length < 1) {
        console.log("no maps")
        return
      }
      const json = doc.toJSON(get_class_registry())
      console.log("json is", json)
      player.stop()
      player.start(ref.current, json, new ConsoleLogger())
    }
  }
  useWatchAllProps(props.camera, () => rebuild())
  useEffect(() => rebuild(), [props.camera])
  return (
    <>
      <div className={"vbox tool-column"}>camera tools</div>
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
