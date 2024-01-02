import { Point } from "josh_js_util"
import { toClass } from "josh_react_util"
import React, { useContext, useEffect, useRef, useState } from "react"

import { ListSelect } from "../common/ListSelect"
import { ListViewOptions, ListViewRenderer } from "../common/ListView"
import { drawTextRun } from "../fonteditor/PixelFontPreview"
import { Actor, ViewSettings } from "../model/actor"
import { appendToList, removeFromList, UUID } from "../model/base"
import { DocContext, ImageSnapshotContext } from "../model/contexts"
import { GameDoc } from "../model/gamedoc"
import { ActorInstance, ActorLayer } from "../model/gamemap"
import { ImageSnapshotCache } from "../model/ImageSnapshotCache"
import { fillBounds, strokeBounds } from "../util"
import { DrawArgs, MouseEventArgs, MouseHandler } from "./editorbase"

export function findActorForInstance(inst: ActorInstance, doc: GameDoc) {
  const actor_id = inst.getPropValue("actor")
  return doc.getPropValue("actors").find((act) => act.getUUID() === actor_id)
}

export function drawActorlayer(
  ctx: CanvasRenderingContext2D,
  doc: GameDoc,
  layer: ActorLayer,
  scale: number,
  isc: ImageSnapshotCache,
) {
  layer.getPropValue("actors").forEach((inst) => {
    const position = inst.getPropValue("position")
    const actor = findActorForInstance(inst, doc)
    if (actor) {
      const view = actor.getPropValue("view")
      const box = view.getPropValue("bounds").add(position).scale(scale)
      const kind = view.getPropValue("kind")
      if (kind === "sprite") {
        const imageRef = view.getPropValue("reference")
        if (imageRef) {
          const snap = isc.getSnapshotCanvas(imageRef as UUID)
          ctx.imageSmoothingEnabled = false
          ctx.drawImage(snap, box.x, box.y, snap.width * scale, snap.height * scale)
        } else {
          // if we get here then normal drawing failed, so just do a box
          fillBounds(ctx, box, "orange")
        }
      }
      if (kind === "text") {
        const fontid = view.getPropValue("reference")
        const font = doc.fonts().find((fnt) => fnt.getUUID() === fontid)
        if (font) {
          ctx.save()
          ctx.translate(box.x, box.y)
          drawTextRun(ctx, "sometext", font, 3, "black")
          ctx.restore()
        }
      }
    }
  })
}

function ImageActorView(props: { actor: Actor; scale: number }) {
  const { actor, scale } = props
  const ref = useRef<HTMLCanvasElement>(null)
  const isc = useContext(ImageSnapshotContext)
  const view = actor.getPropValue("view") as ViewSettings
  const bounds = view.getPropValue("bounds")
  useEffect(() => {
    if (ref.current) {
      if (view.getPropValue("kind") === "sprite") {
        const ctx = ref.current.getContext("2d") as CanvasRenderingContext2D
        ctx.fillStyle = "white"
        ctx.fillRect(0, 0, ref.current.width, ref.current.height)
        const spriteId = view.getPropValue("reference")
        const snap = isc.getSnapshotCanvas(spriteId as UUID)
        ctx.imageSmoothingEnabled = false
        ctx.drawImage(snap, 0, 0, snap.width * scale, snap.height * scale)
      }
    }
  }, [ref])
  return <canvas ref={ref} width={bounds.w * scale} height={bounds.h * scale} />
}

function TextActorView(props: { actor: Actor; scale: number }) {
  const { actor, scale } = props
  const ref = useRef<HTMLCanvasElement>(null)
  const doc = useContext(DocContext)
  const view = actor.getPropValue("view") as ViewSettings
  const bounds = view.getPropValue("bounds")
  useEffect(() => {
    if (ref.current) {
      if (view.getPropValue("kind") === "text") {
        const ctx = ref.current.getContext("2d") as CanvasRenderingContext2D
        ctx.fillStyle = "magenta"
        ctx.fillRect(0, 0, ref.current.width, ref.current.height)
        const fontid = view.getPropValue("reference")
        const font = doc.fonts().find((fnt) => fnt.getUUID() === fontid)
        console.log("the font is", font)
        if (font) {
          console.log("drawing text", "sometext")
          drawTextRun(ctx, "sometext", font, 3, "black")
        }
      }
    }
  }, [ref])
  return <canvas ref={ref} width={bounds.w * scale} height={bounds.h * scale} />
}

function ActorSnapshotView(props: { actor: Actor; scale: number }) {
  const { actor, scale } = props
  const view = actor.getPropValue("view") as ViewSettings
  const kind = view.getPropValue("kind")
  if (kind === "sprite") return <ImageActorView actor={actor} scale={scale} />
  if (kind === "text") return <TextActorView actor={actor} scale={scale} />
  return <div>no view</div>
}

const ActorPreviewRenderer: ListViewRenderer<Actor, never> = (props: {
  value: Actor | undefined
  selected: boolean
  options?: ListViewOptions
}) => {
  const { selected, value } = props
  if (!value) return <div>nothing selected</div>
  return (
    <div
      className={toClass({
        "std-list-item": true,
        selected: selected,
      })}
      style={{
        minWidth: "10rem",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <b>{value.getPropValue("name")}</b>
      <ActorSnapshotView actor={value} scale={3} />
    </div>
  )
}

export function ActorLayerToolbar(props: {
  layer: ActorLayer
  onSelect: (act: ActorInstance) => void
  selected: ActorInstance | undefined
}) {
  const { layer, onSelect } = props
  const doc = useContext(DocContext)
  const [selected, setSelected] = useState<Actor | undefined>(undefined)
  const add_actor = () => {
    if (!selected) return
    const player = new ActorInstance({
      name: "new ref",
      actor: selected._id,
      position: new Point(50, 30),
    })
    appendToList(layer, "actors", player)
    onSelect(player)
  }
  const delete_actor = () => {
    if (props.selected) removeFromList(layer, "actors", props.selected)
  }
  return (
    <div className={"toolbar"}>
      <label>actors</label>
      <ListSelect
        selected={selected}
        data={doc.getPropValue("actors")}
        setSelected={setSelected}
        renderer={ActorPreviewRenderer}
        options={undefined as never}
      />
      <button disabled={!selected} onClick={add_actor}>
        add actor
      </button>
      <button onClick={delete_actor}>delete selected actor</button>
    </div>
  )
}

export function drawSelectedActor(
  ctx: CanvasRenderingContext2D,
  doc: GameDoc,
  inst: ActorInstance,
  scale: number,
) {
  const position = inst.getPropValue("position")
  const source = findActorForInstance(inst, doc)
  if (source) {
    const box = source.getPropValue("view").getPropValue("bounds")
    strokeBounds(ctx, box.add(position).scale(scale), "orange", 3)
  }
}

export function findActorAtPosition(doc: GameDoc, layer: ActorLayer, point: Point) {
  return layer.getPropValue("actors").find((inst) => {
    const actt = findActorForInstance(inst, doc)
    if (actt) {
      const box = actt
        .getPropValue("view")
        .getPropValue("bounds")
        .add(inst.getPropValue("position"))
      console.log("box is", box)
      if (box.contains(point)) {
        return true
      }
    }
    return false
  })
}

export class ActorLayerMouseHandler implements MouseHandler<ActorLayer> {
  onMouseDown(v: MouseEventArgs<ActorLayer>): void {
    v.setSelectedActor(findActorAtPosition(v.doc, v.layer, v.pt))
  }

  onMouseMove(v: MouseEventArgs<ActorLayer>): void {
    if (v.selectedActor) {
      const pt = v.pt
      v.selectedActor.setPropValue("position", pt)
    }
  }

  onMouseUp(): void {}

  drawOverlay(v: DrawArgs<ActorLayer>): void {
    if (v.selectedActor) {
      drawSelectedActor(v.ctx, v.doc, v.selectedActor, v.scale)
    }
  }
}
