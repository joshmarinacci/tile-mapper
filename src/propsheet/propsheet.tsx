import "./propsheet.css"

import React, { useContext, useEffect, useRef, useState } from "react"

import { drawEditableSprite } from "../common/common"
import { Pane } from "../common/common-components"
import { ActorType } from "../model/actor"
import { FloatSettings, IntegerSettings, PropDef, PropsBase, useWatchProp } from "../model/base"
import { DocContext } from "../model/contexts"
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

function IntegerPropEditor(props: { def: PropDef<number>; name: string; target: PropsBase<any> }) {
  const { target, name, def } = props
  const new_val = Math.floor(target.getPropValue(name))
  const [temp_val, set_temp_val] = useState(new_val + "")
  let step = 0.1
  let min = undefined
  let max = undefined
  if (def.settings && def.settings.type === "integer") {
    const set = def.settings as IntegerSettings
    step = set.stepSize
    min = set.min
    max = set.max
  }
  return (
    <input
      type={"number"}
      value={temp_val}
      step={step}
      min={min}
      max={max}
      onChange={(e) => {
        const vv = parseInt(e.target.value, 10)
        set_temp_val(e.target.value)
        if (Number.isInteger(vv)) {
          target.setPropValue(name, vv)
        }
      }}
      onBlur={(e) => {
        set_temp_val(target.getPropValue(props.name).toFixed(0) + "")
      }}
    />
  )
}

function FloatPropEditor(props: { def: PropDef<number>; name: string; target: PropsBase<any> }) {
  const { target, name, def } = props
  const new_val = (target.getPropValue(name) as number).toFixed(2)
  const [temp_val, set_temp_val] = useState(new_val + "")
  let step = 0.1
  let min = undefined
  let max = undefined
  if (def.settings && def.settings.type === "float") {
    const set = def.settings as FloatSettings
    step = set.stepSize
    min = set.min
    max = set.max
  }
  return (
    <input
      type={"number"}
      value={temp_val}
      step={step}
      min={min}
      max={max}
      onChange={(e) => {
        const vv = parseFloat(e.target.value)
        set_temp_val(e.target.value)
        if (!Number.isNaN(vv)) {
          target.setPropValue(props.name, vv)
        }
      }}
      onBlur={(e) => {
        set_temp_val(target.getPropValue(props.name).toFixed(2) + "")
      }}
    />
  )
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
  const key = `editor_${name.toString()}`
  if (def.type === "integer")
    return <IntegerPropEditor key={key} target={target} def={def} name={name} />
  if (def.type === "float") {
    return <FloatPropEditor key={key} target={target} def={def} name={name} />
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
  collapsed?: boolean
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
    <Pane
      title={title ? title : "props"}
      collapsable={props.collapsable}
      collapsed={props.collapsed}
      className={"prop-sheet"}
    >
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
