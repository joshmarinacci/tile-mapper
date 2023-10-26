import React, { useContext } from "react"

import { ListSelect } from "../common/ListSelect"
import { PropDef, PropsBase } from "../model/base"
import { DocContext } from "../model/contexts"
import { GameMap } from "../model/datamodel"

function MapNameRenderer<T extends GameMap, O>(props: { value: T; selected: boolean; options: O }) {
  if (!props.value) return <div>undefined</div>
  return <div className={"std-list-item"}>{props.value.getPropValue("name")}</div>
}

export function MapReferenceEditor<T>(props: {
  def: PropDef<T[keyof T]>
  name: keyof T
  target: PropsBase<T>
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
