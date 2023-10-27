import React, { useContext } from "react"

import { ListSelect } from "../common/ListSelect"
import { PropDef, PropsBase } from "../model/base"
import { DocContext } from "../model/contexts"

function PaletteColorNameRenderer<T extends string, O>(props: {
  value: T | undefined
  selected: boolean
  options: O
}) {
  return (
    <div
      style={{
        backgroundColor: `${props.value?.toString()}`,
      }}
    >
      {props.value?.toString()}
    </div>
  )
}

export function PaletteColorSelector<T>(props: {
  def: PropDef<string>
  name: keyof T
  target: PropsBase<T>
}) {
  const doc = useContext(DocContext)
  const current = props.target.getPropValue(props.name)
  const palette = doc.getPropValue("palette")
  return (
    <ListSelect<string, never>
      selected={current as string}
      setSelected={(v) => {
        if (v) props.target.setPropValue(props.name, v as T[keyof T])
      }}
      renderer={PaletteColorNameRenderer}
      data={palette.colors}
      options={undefined as never}
    />
  )
}
