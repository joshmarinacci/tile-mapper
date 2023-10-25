import React, { useContext } from "react"

import { DocContext } from "../common/common-components"
import { ListSelect } from "../common/ListSelect"
import { PropDef, PropsBase } from "../model/base"
import { SImage } from "../model/datamodel"

function ImageNameRenderer<T extends SImage, O>(props: {
  value: T
  selected: boolean
  options: O
}) {
  if (!props.value) return <div>undefined</div>
  return <div className={"std-list-item"}>{props.value.getPropValue("name")}</div>
}

export function ImageReferenceEditor<T>(props: {
  def: PropDef<T[keyof T]>
  name: keyof T
  target: PropsBase<T>
}) {
  const doc = useContext(DocContext)
  const current = props.target.getPropValue(props.name)
  const selected = doc.getPropValue("canvases").find((mp) => mp.getUUID() === current)
  const data = doc.getPropValue("canvases")
  return (
    <ListSelect
      selected={selected}
      setSelected={(v) => props.target.setPropValue(props.name, v.getUUID())}
      renderer={ImageNameRenderer}
      data={data}
      options={{}}
    />
  )
}
