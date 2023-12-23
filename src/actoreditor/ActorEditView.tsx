import "./ActorEditView.css"

import React, { useContext, useEffect, useRef, useState } from "react"

import { IconButton } from "../common/common-components"
import { Icons } from "../common/icons"
import { GameAction } from "../model/action"
import { Actor } from "../model/actor"
import { appendToList, useWatchAllProps, UUID } from "../model/base"
import { DocContext, ImageSnapshotContext, StateContext } from "../model/contexts"
import { strokeBounds } from "../util"
import { ActionEditor } from "./ActionEditor"

export function ActorEditView(props: { actor: Actor }) {
  const [zoom, setZoom] = useState(4)
  const spriteId = props.actor.getPropValue("sprite")
  const scale = Math.pow(2, zoom)
  const state = useContext(StateContext)
  const doc = useContext(DocContext)
  const ref = useRef<HTMLCanvasElement>(null)
  const editSprite = () => {
    const img = doc.getPropValue("canvases").find((img) => img.getUUID() === spriteId)
    if (img) {
      state.setSelectionTarget(img)
    }
  }

  const isc = useContext(ImageSnapshotContext)
  function redraw() {
    if (ref.current) {
      const ctx = ref.current.getContext("2d") as CanvasRenderingContext2D
      ctx.fillStyle = "white"
      ctx.fillRect(0, 0, ref.current.width, ref.current.height)
      const snap = isc.getSnapshotCanvas(spriteId as UUID)
      ctx.imageSmoothingEnabled = false
      ctx.drawImage(snap, 0, 0, snap.width * scale, snap.height * scale)
      const view_bounds = props.actor.getPropValue("viewbox").scale(scale)
      strokeBounds(ctx, view_bounds, "red", 3)
      const hit_bounds = props.actor.getPropValue("hitbox").scale(scale)
      strokeBounds(ctx, hit_bounds, "magenta", 3)
    }
  }

  useEffect(() => redraw(), [spriteId, scale])
  useWatchAllProps(props.actor, () => redraw())

  const add_action = () => {
    const act = new GameAction({ name: "unknown action" })
    appendToList(props.actor, "actions", act)
    state.setSelectionTarget(act)
  }
  return (
    <>
      <div className={"tool-column"}>
        <button onClick={add_action}>add action</button>
        {props.actor.getPropValue("actions").map((act) => {
          return <ActionEditor actor={props.actor} action={act} />
        })}
      </div>
      <div className={"editor-view"}>
        <div className={"toolbar"}>
          <IconButton onClick={() => setZoom(zoom - 1)} icon={Icons.Minus} tooltip={"zoom in"} />
          <IconButton onClick={() => setZoom(zoom + 1)} icon={Icons.Plus} tooltip={"zoom out"} />
          <button onClick={() => editSprite()}>edit sprite</button>
        </div>
        <canvas ref={ref} width={512} height={512} />
      </div>
    </>
  )
}
