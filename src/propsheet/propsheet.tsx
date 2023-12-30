import "./propsheet.css"

import { toClass } from "josh_react_util"
import React, { useContext, useEffect, useRef, useState } from "react"

import { drawEditableSprite } from "../common/common"
import { Pane } from "../common/common-components"
import { ListSelect } from "../common/ListSelect"
import { ListViewRenderer } from "../common/ListView"
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

const PossibleStringValuesRenderer: ListViewRenderer<string, never> = (props: {
  value: string
  selected: boolean
  options?: never
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
      <b>{value}</b>
    </div>
  )
}

function PossibleStringValuesEditor<T>(props: {
  def: PropDef<T[keyof T]>
  name: keyof T
  target: PropsBase<T>
}) {
  const { def, name, target } = props
  const selected = target.getPropValue(name)
  const setSelected = (v: T[keyof T] | undefined): void => {
    console.log("setting selected to", v)
    target.setPropValue(name, v)
  }
  const data = def.possibleValues()
  return (
    <ListSelect
      selected={selected}
      setSelected={setSelected}
      renderer={PossibleStringValuesRenderer}
      data={data}
      options={undefined as never}
    />
  )
}

function SubObjectPropEditor<T>(props: {
  def: PropDef<T[keyof T]>
  name: keyof T
  target: T[keyof T]
}) {
  const propnames = Array.from(props.target.getAllPropDefs()).filter(([, b]) => !b.hidden)
  return (
    <div className={"prop-sheet-contents sub-object"}>
      {propnames.map(([pname, def]) => {
        return (
          <>
            <label key={`label_${props.name.toString()}_${pname.toString()}`}>
              {pname.toString()}
            </label>
            <PropEditor
              key={`editor_${props.name.toString()}_${pname.toString()}`}
              target={props.target}
              name={pname}
              def={def}
            />
          </>
        )
      })}
    </div>
  )
}

type Rec = Record<string, any>
function RecordPropEditor<T>(props: {
  def: PropDef<T[keyof T]>
  name: keyof T
  target: PropsBase<T>
}) {
  const { def, name, target } = props
  const [recName, setRecName] = useState("name")
  const [recValue, setRecValue] = useState("value")
  const record = target.getPropValue(name) as Rec
  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>name</th>
            <th>default value</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(record).map((ent) => {
            return (
              <tr>
                <td>{ent[0]}</td>
                <td>{ent[1]}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <label>name</label>
      <input value={recName} onChange={(e) => setRecName(e.target.value)} />
      <label>value</label>
      <input value={recValue} onChange={(e) => setRecValue(e.target.value)} />
      <button
        onClick={() => {
          const rec: Record<string, any> = props.target.getPropValue(props.name)
          const rec2: Record<string, any> = { ...rec }
          rec2[recName] = recValue
          props.target.setPropValue(props.name, rec2)
        }}
      >
        add entry
      </button>
    </div>
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
  const key = `editor_${name.toString()}`
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
    if (def.possibleValues) {
      return <PossibleStringValuesEditor key={key} target={target} def={def} name={name} />
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
  if (def.type === "object" && def.custom === "sub-object") {
    return <SubObjectPropEditor key={key} target={new_val} def={def} name={name} />
  }
  if (def.type === "record") {
    return <RecordPropEditor key={key} target={target} def={def} name={name} />
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
