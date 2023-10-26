import { Bounds } from "josh_js_util"
import React from "react"

import { PropDef, PropsBase } from "../model/base"

export function BoundsPropEditor<T>(props: {
  def: PropDef<Bounds>
  name: keyof T
  target: PropsBase<T>
}) {
  const { target, name } = props
  const val = target.getPropValue(name) as Bounds
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
