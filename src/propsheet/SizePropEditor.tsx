import { Size } from "josh_js_util"
import React from "react"

import { PropDef, PropsBase } from "../model/base"

export function SizePropEditor<T>(props: {
  def: PropDef<Size>
  name: keyof T
  target: PropsBase<T>
}) {
  const { name, target } = props
  const val = target.getPropValue(name) as Size
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
          target.setPropValue(props.name, size as T[keyof T])
        }}
      />
    </>
  )
}
