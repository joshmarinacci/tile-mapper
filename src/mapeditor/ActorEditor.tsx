import { Point } from "josh_js_util"
import { toClass } from "josh_react_util"
import React, { useContext, useState } from "react"

import { DocContext } from "../common/common-components"
import { ListSelect } from "../common/ListSelect"
import { ListViewOptions, ListViewRenderer } from "../common/ListView"
import { TileReferenceView } from "../common/propsheet"
import { drawImage } from "../imageeditor/SImageEditorView"
import { appendToList } from "../model/base"
import { Actor, ActorInstance, ActorLayer, GameDoc } from "../model/datamodel"
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
  grid: boolean,
) {
  layer.getPropValue("actors").forEach((inst) => {
    const position = inst.getPropValue("position")
    const source = findActorForInstance(inst, doc)
    if (source) {
      const box = source.getPropValue("viewbox").add(position).scale(scale)
      const imageRef = source.getPropValue("sprite")
      if (imageRef) {
        const img = doc
          .getPropValue("canvases")
          .find((can) => can.getUUID() === imageRef)
        if (img) {
          ctx.save()
          ctx.translate(box.x, box.y)
          drawImage(ctx, img, doc.getPropValue("palette"), scale)
          ctx.restore()
          return
        }
      }
      // if we get here then normal drawing failed, so just do a box
      fillBounds(ctx, box, "orange")
    }
  })
}

const ActorPreviewRenderer: ListViewRenderer<Actor, never> = (props: {
  value: Actor;
  selected: boolean;
  options?: ListViewOptions;
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
      <TileReferenceView tileRef={value.getPropValue("sprite")} />
    </div>
  )
}

export function ActorLayerToolbar(props: {
  layer: ActorLayer;
  onSelect: (act: ActorInstance) => void;
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
    </div>
  )
}

export function drawSelectedActor(
  ctx: CanvasRenderingContext2D,
  doc: GameDoc,
  inst: ActorInstance,
  scale: number,
  grid: boolean,
) {
  const position = inst.getPropValue("position")
  const source = findActorForInstance(inst, doc)
  if (source) {
    const box = source.getPropValue("viewbox")
    strokeBounds(ctx, box.add(position).scale(scale), "orange", 3)
  }
}

export function findActorAtPosition(
  doc: GameDoc,
  layer: ActorLayer,
  point: Point,
) {
  return layer.getPropValue("actors").find((inst) => {
    const actt = findActorForInstance(inst, doc)
    if (actt) {
      const box = actt
        .getPropValue("viewbox")
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

  onMouseUp(v: MouseEventArgs<ActorLayer>): void {}

  drawOverlay(v: DrawArgs<ActorLayer>): void {
    if (v.selectedActor) {
      drawSelectedActor(v.ctx, v.doc, v.selectedActor, v.scale, v.grid)
    }
  }
}
