import React, { useContext, useEffect, useRef, useState } from "react"

import { Icons } from "./common/common"
import { IconButton } from "./common/common-components"
import { drawImage } from "./imageeditor/ImageEditorView"
import { useWatchAllProps, useWatchProp } from "./model/base"
import { DocContext } from "./model/contexts"
import { Actor } from "./model/datamodel"
import { strokeBounds } from "./util"

function SpriteView(props: {
  sprite: string
  scale: number
  onDraw: (ctx: CanvasRenderingContext2D) => void
}) {
  const doc = useContext(DocContext)
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    if (ref.current) {
      const ctx = ref.current.getContext("2d") as CanvasRenderingContext2D
      ctx.fillStyle = "white"
      ctx.fillRect(0, 0, ref.current.width, ref.current.height)
      const img = doc.getPropValue("canvases").find((img) => img.getUUID() === props.sprite)
      if (img) {
        drawImage(doc, ctx, img, doc.getPropValue("palette"), props.scale)
      }
      props.onDraw(ctx)
    }
  }, [props.sprite, props.scale])
  return (
    <div>
      <canvas ref={ref} width={512} height={512} />
    </div>
  )
}

export function ActorEditView(props: { actor: Actor }) {
  const [zoom, setZoom] = useState(0)
  const sprite = props.actor.getPropValue("sprite")
  useWatchAllProps(props.actor)
  useWatchProp(props.actor, "hitbox")
  const scale = Math.pow(2, zoom)
  return (
    <>
      <div className={"tool-column"}> tool column </div>
      <div className={"editor-view"}>
        <div className={"toolbar"}>
          <IconButton onClick={() => setZoom(zoom - 1)} icon={Icons.Minus} />
          <IconButton onClick={() => setZoom(zoom + 1)} icon={Icons.Plus} />
        </div>
        {sprite && (
          <SpriteView
            sprite={sprite}
            scale={scale}
            onDraw={(ctx: CanvasRenderingContext2D) => {
              const view_bounds = props.actor.getPropValue("viewbox").scale(scale)
              strokeBounds(ctx, view_bounds, "red", 3)
              const hit_bounds = props.actor.getPropValue("hitbox").scale(scale)
              strokeBounds(ctx, hit_bounds, "magenta", 3)
            }}
          />
        )}
      </div>
    </>
  )
}
