import React, { useContext } from "react"

import { ListSelect } from "../common/ListSelect"
import { PropDef, PropsBase } from "../model/base"
import { DocContext } from "../model/contexts"
import { PixelFont } from "../model/datamodel"

function PixelFontNameRenderer<T extends PixelFont, O>(props: {
  value: T
  selected: boolean
  options: O
}) {
  if (!props.value) return <div>undefined</div>
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
      setSelected={(v) => props.target.setPropValue(props.name, v.getUUID())}
      renderer={PixelFontNameRenderer}
      data={data}
      options={{}}
    />
  )
}
