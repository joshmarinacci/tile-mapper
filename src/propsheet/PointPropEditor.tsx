import { Point } from "josh_js_util"
import React from "react"

import { PropDef, PropsBase } from "../model/base"

export function PointPropEditor<T>(props: {
  def: PropDef<Point>
  name: keyof T
  target: PropsBase<T>
}) {
  const { target, name } = props
  const val = target.getPropValue(name) as Point
  return (
    <>
      <label key={`editor_${name.toString()}_x_label`}>x</label>
      <input
        key={`editor_${name.toString()}_x_input`}
        type={"number"}
        value={val.x}
        onChange={(e) => {
          const v = parseInt(e.target.value)
          const point = new Point(v, val.y)
          target.setPropValue(props.name, point as T[keyof T])
        }}
      />
      <label key={`editor_${name.toString()}_y_label`}>y</label>
      <input
        key={`editor_${name.toString()}_y_input`}
        type={"number"}
        value={val.y}
        onChange={(e) => {
          const v = parseInt(e.target.value)
          const point = new Point(val.x, v)
          props.target.setPropValue(props.name, point as T[keyof T])
        }}
      />
    </>
  )
}
