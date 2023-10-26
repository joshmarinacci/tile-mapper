import React, { useContext } from "react"

import { ListSelect } from "../common/ListSelect"
import { PropDef, PropsBase } from "../model/base"
import { DocContext } from "../model/contexts"

function PaletteColorNameRenderer<T extends string, O>(props: {
  value: T
  selected: boolean
  options: O
}) {
  return (
    <div
      style={{
        backgroundColor: `${props.value.toString()}`,
      }}
    >
      {props.value.toString()}
    </div>
  )
}

export function PaletteColorSelector<T, V = T[keyof T]>(props: {
  def: PropDef<V>
  name: keyof T
  target: PropsBase<T>
}) {
  const doc = useContext(DocContext)
  const current = props.target.getPropValue(props.name)
  const palette = doc.getPropValue("palette")
  return (
    <ListSelect
      selected={current}
      setSelected={(v) => {
        if (v) props.target.setPropValue(props.name, v)
      }}
      renderer={PaletteColorNameRenderer}
      data={palette.colors}
      options={{}}
    />
  )
}
