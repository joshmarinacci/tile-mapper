import "./propsheet.css"

import { Bounds, Size } from "josh_js_util"
import React, { useContext, useEffect, useRef } from "react"

import { PropDef, PropsBase, useWatchProp } from "../model/base"
import {
  ActorKind,
  ActorType,
  GameMap,
  SImage,
} from "../model/datamodel"
import { drawEditableSprite } from "./common"
import {DocContext, Pane} from "./common-components"
import { ListSelect } from "./ListSelect"

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
        if (tile) drawEditableSprite(ctx, 3, tile, doc.getPropValue('palette'))
      }
    }
  }, [props.tileRef])
  return <canvas ref={canvasRef} width={32} height={32} />
}


function MapNameRenderer<T extends GameMap, O>(props: {
  value: T;
  selected: boolean;
  options: O;
}) {
  if (!props.value) return <div>undefined</div>
  return <div className={'std-list-item'}>{props.value.getPropValue("name")}</div>
}
function MapReferenceEditor<T>(props: {
  def: PropDef<T[keyof T]>;
  name: keyof T;
  target: PropsBase<T>;
}) {
  const doc = useContext(DocContext)
  const { target, name } = props
  const current = target.getPropValue(name)
  const selected = doc.getPropValue("maps").find((mp) => mp.getUUID() === current)
  const data = doc.getPropValue("maps")
  return (
    <ListSelect
      selected={selected}
      setSelected={(v) => target.setPropValue(name, v.getUUID())}
      renderer={MapNameRenderer}
      data={data}
      options={{}}
    />
  )
}

function SImageNameRenderer<T extends SImage, O>(props: {
  value: T;
  selected: boolean;
  options: O;
}) {
  if (!props.value) return <div>undefined</div>
  return <div className={'std-list-item'}>{props.value.getPropValue("name")}</div>
}
function SImageReferenceEditor<T>(props: {
  def: PropDef<T[keyof T]>;
  name: keyof T;
  target: PropsBase<T>;
}) {
  const doc = useContext(DocContext)
  const current = props.target.getPropValue(props.name)
  const selected = doc.getPropValue("canvases").find((mp) => mp.getUUID() === current)
  const data = doc.getPropValue("canvases")
  return (
    <ListSelect
      selected={selected}
      setSelected={(v) => props.target.setPropValue(props.name, v.getUUID())}
      renderer={SImageNameRenderer}
      data={data}
      options={{}}
    />
  )
}

function ActorTypeRenderer<T extends ActorKind, O>(props: {
  value: T;
  selected: boolean;
  options: O;
}) {
  if (!props.value) return <div>undefined</div>
  return <div className={'std-list-item'}>{props.value}</div>
}

function ActorTypeEditor<T extends ActorType>(props: {
  def: PropDef<T[keyof T]>;
  name: keyof T;
  target: PropsBase<T>;
}) {
  // const selected = props.target.getPropValue('kind')
  return (
    <ListSelect
      selected={props.target.getPropValue("kind")}
      setSelected={(kind: ActorKind) => props.target.setPropValue("kind", kind)}
      renderer={ActorTypeRenderer}
      data={["item", "player", "enemy"]}
      options={{}}
    />
  )
}

function PropEditor<T>(props: {
  target: PropsBase<T>;
  name: keyof T;
  def: PropDef<T[keyof T]>;
}) {
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
          props.target.setPropValue(
            props.name,
            parseInt(e.target.value) as T[keyof T],
          )
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
          props.target.setPropValue(
            props.name,
            parseFloat(e.target.value) as T[keyof T],
          )
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
    const val = new_val as Size
    return (
      <>
        <label key={`editor_${name.toString()}_w_label`}>w</label>
        <input
          key={`editor_${name.toString()}_w_input`}
          type={"number"}
          value={val.w}
          onChange={(e) => {
            const v = parseInt(e.target.value)
            const size = new Size(v, val.h)
            target.setPropValue(props.name, size as T[keyof T])
          }}
        />
        <label key={`editor_${name.toString()}_h_label`}>h</label>
        <input
          key={`editor_${name.toString()}_h_input`}
          type={"number"}
          value={val.h}
          onChange={(e) => {
            const v = parseInt(e.target.value)
            const size = new Size(val.w, v)
            props.target.setPropValue(props.name, size as T[keyof T])
          }}
        />
      </>
    )
  }
  if (def.type === "Bounds") {
    const val = new_val as Bounds
    return (
      <>
        <label key={`editor_${name.toString()}_x_label`}>x</label>
        <input
          key={`editor_${name.toString()}_x_input`}
          type={"number"}
          value={val.x}
          onChange={(e) => {
            const v = parseInt(e.target.value)
            const bounds = new Bounds(v, val.y, val.w, val.h)
            target.setPropValue(props.name, bounds as T[keyof T])
          }}
        />
        <label key={`editor_${name.toString()}_y_label`}>y</label>
        <input
          key={`editor_${name.toString()}_y_input`}
          type={"number"}
          value={val.y}
          onChange={(e) => {
            const v = parseInt(e.target.value)
            const bounds = new Bounds(val.x, v, val.w, val.h)
            target.setPropValue(props.name, bounds as T[keyof T])
          }}
        />
        <label key={`editor_${name.toString()}_w_label`}>w</label>
        <input
          key={`editor_${name.toString()}_w_input`}
          type={"number"}
          value={val.w}
          onChange={(e) => {
            const v = parseInt(e.target.value)
            const bounds = new Bounds(val.x, val.y, v, val.h)
            target.setPropValue(props.name, bounds as T[keyof T])
          }}
        />
        <label key={`editor_${name.toString()}_h_label`}>h</label>
        <input
          key={`editor_${name.toString()}_h_input`}
          type={"number"}
          value={val.h}
          onChange={(e) => {
            const v = parseInt(e.target.value)
            const bounds = new Bounds(val.x, val.y, val.w, v)
            props.target.setPropValue(props.name, bounds as T[keyof T])
          }}
        />
      </>
    )
  }
  if (def.type === "reference" && def.custom === "image-reference") {
    return (
      <SImageReferenceEditor
        key={`editor_${name.toString()}`}
        target={target}
        def={def}
        name={name}
      />
    )
  }
  if (def.type === "reference" && def.custom === "map-reference") {
    return (
      <MapReferenceEditor
        key={`editor_${name.toString()}`}
        target={target}
        def={def}
        name={name}
      />
    )
  }
  return <label key={"nothing"}>no editor for it</label>
}

export function PropSheet<T>(props: {
  title?: string;
  target: PropsBase<T> | undefined;
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
  const propnames = Array.from(target.getAllPropDefs()).filter(
    ([, b]) => !b.hidden,
  )
  return (
      <Pane title={title?title:"props"} collapsable={props.collapsable} className={'prop-sheet'}>
      {/*{header}*/}
          <div className={'prop-sheet-contents'}>
      <label>UUID</label>
      <label className={"value"}>{target ? target.getUUID() : "????"}</label>
      {propnames.map(([name, def]) => {
        return (
          <>
            <label key={`label_${name.toString()}`}>{name.toString()}</label>
            <PropEditor
              key={`editor_${name.toString()}`}
              target={target}
              name={name}
              def={def}
            />
          </>
        )
      })}

          </div>
      </Pane>
  )
}
