import React, { useContext } from "react"

import { ListSelect } from "../common/ListSelect"
import { PropDef, PropsBase } from "../model/base"
import { DocContext } from "../model/contexts"
import { PixelFont } from "../model/pixelfont"

function PixelFontNameRenderer<T extends PixelFont, O>(props: {
  value: T | undefined
  selected: boolean
  options: O
}) {
  if (!props.value) return <div>missing</div>
  return <div className={"std-list-item"}>{props.value.getPropValue("name")}</div>
}

export function PixelFontReferenceEditor<T>(props: {
  def: PropDef<T[keyof T]>
  name: keyof T
  target: PropsBase<T>
}) {
  const doc = useContext(DocContext)
  const current = props.target.getPropValue(props.name)
  const selected = doc.getPropValue("fonts").find((mp) => mp.getUUID() === current)
  const data = doc.getPropValue("fonts")
  return (
    <ListSelect
      selected={selected}
      setSelected={(v) => {
        if (v) props.target.setPropValue(props.name, v.getUUID() as T[keyof T])
      }}
      renderer={PixelFontNameRenderer}
      data={data}
      options={{}}
    />
  )
}
