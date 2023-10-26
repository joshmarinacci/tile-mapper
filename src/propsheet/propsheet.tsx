import "./propsheet.css"

import React, { useContext, useEffect, useRef } from "react"

import { drawEditableSprite } from "../common/common"
import { Pane } from "../common/common-components"
import { PropDef, PropsBase, useWatchProp } from "../model/base"
import { DocContext } from "../model/contexts"
import { ActorType } from "../model/datamodel"
import { ActorTypeEditor } from "./ActorTypeEditor"
import { BoundsPropEditor } from "./BoundsPropEditor"
import { ImageReferenceEditor } from "./ImageReferenceEditor"
import { MapReferenceEditor } from "./MapReferenceEditor"
import { PaletteColorSelector } from "./PaletteColorSelector"
import { PixelFontReferenceEditor } from "./PixelFontReferenceEditor"
import { PointPropEditor } from "./PointPropEditor"
import { SizePropEditor } from "./SizePropEditor"

export function TileReferenceView(props: { tileRef: string | undefined }) {
  const { tileRef } = props
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const doc = useContext(DocContext)
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d") as CanvasRenderingContext2D
      ctx.fillStyle = "blue"
      ctx.fillRect(0, 0, 32, 32)
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      if (tileRef) {
        const tile = doc.lookup_sprite(tileRef)
        if (tile) drawEditableSprite(ctx, 3, tile, doc.getPropValue("palette"))
      }
    }
  }, [props.tileRef])
  return <canvas ref={canvasRef} width={32} height={32} />
}

function PropEditor<T>(props: { target: PropsBase<T>; name: keyof T; def: PropDef<T[keyof T]> }) {
  const { target, def, name } = props
  const new_val = target.getPropValue(name)
  useWatchProp(target, name)
  if (!def.editable) {
    return (
      <span key={`value_${name.toString()}`} className={"value"}>
        <b>{props.def.format(new_val)}</b>
      </span>
    )
  }
  if (def.type === "string") {
    if (def.custom === "actor-type") {
      return (
        <ActorTypeEditor
          key={`editor_${name.toString()}`}
          target={target as unknown as PropsBase<ActorType>}
          def={def}
          name={name}
        />
      )
    }
    if (def.custom === "palette-color") {
      return (
        <PaletteColorSelector
          key={`editor_${name.toString()}`}
          target={target}
          def={def}
          name={name}
        />
      )
    }
    return (
      <input
        key={`editor_${name.toString()}`}
        type={"text"}
        value={new_val + ""}
        onChange={(e) => {
          target.setPropValue(name, e.target.value as T[keyof T])
        }}
      />
    )
  }
  if (def.type === "integer") {
    return (
      <input
        key={`editor_${name.toString()}`}
        type={"number"}
        value={Math.floor(new_val as number)}
        onChange={(e) => {
          props.target.setPropValue(props.name, parseInt(e.target.value) as T[keyof T])
        }}
      />
    )
  }
  if (def.type === "float") {
    return (
      <input
        key={`editor_${name.toString()}`}
        type={"number"}
        value={(new_val as number).toFixed(2)}
        step={0.1}
        onChange={(e) => {
          props.target.setPropValue(props.name, parseFloat(e.target.value) as T[keyof T])
        }}
      />
    )
  }
  if (def.type === "boolean") {
    return (
      <input
        key={`editor_${name.toString()}`}
        type={"checkbox"}
        checked={new_val as boolean}
        onChange={(e) => {
          props.target.setPropValue(props.name, e.target.checked as T[keyof T])
        }}
      />
    )
  }
  if (def.type === "Size") {
    return (
      <SizePropEditor key={`editor_${name.toString()}`} target={target} def={def} name={name} />
    )
  }
  if (def.type === "Point") {
    return <PointPropEditor target={target} def={def} name={name} />
  }
  if (def.type === "Bounds") {
    return <BoundsPropEditor target={target} def={def} name={name} />
  }
  if (def.type === "reference" && def.custom === "image-reference") {
    return (
      <ImageReferenceEditor
        key={`editor_${name.toString()}`}
        target={target}
        def={def}
        name={name}
      />
    )
  }
  if (def.type === "reference" && def.custom === "font-reference") {
    return (
      <PixelFontReferenceEditor
        key={`editor_${name.toString()}`}
        target={target}
        def={def}
        name={name}
      />
    )
  }
  if (def.type === "reference" && def.custom === "map-reference") {
    return (
      <MapReferenceEditor key={`editor_${name.toString()}`} target={target} def={def} name={name} />
    )
  }
  return <label key={"nothing"}>no editor for it</label>
}

export function PropSheet<T>(props: {
  title?: string
  target: PropsBase<T> | undefined
  collapsable: boolean
}) {
  const { title, target } = props
  const header = <header key={"the-header"}>{title ? title : "props"}</header>
  if (!target)
    return (
      <div className={"pane"} key={"nothing"}>
        {header}nothing selected
      </div>
    )
  const propnames = Array.from(target.getAllPropDefs()).filter(([, b]) => !b.hidden)
  return (
    <Pane title={title ? title : "props"} collapsable={props.collapsable} className={"prop-sheet"}>
      {/*{header}*/}
      <div className={"prop-sheet-contents"}>
        <label>UUID</label>
        <label className={"value"}>{target ? target.getUUID() : "????"}</label>
        {propnames.map(([name, def]) => {
          return (
            <>
              <label key={`label_${name.toString()}`}>{name.toString()}</label>
              <PropEditor key={`editor_${name.toString()}`} target={target} name={name} def={def} />
            </>
          )
        })}
      </div>
    </Pane>
  )
}
