import React from "react"

import { ListSelect } from "../common/ListSelect"
import { PropDef, PropsBase } from "../model/base"
import { ActorKind, ActorType } from "../model/datamodel"

function ActorTypeRenderer<T extends ActorKind, O>(props: {
  value: T | undefined
  selected: boolean
  options: O
}) {
  if (!props.value) return <div>undefined</div>
  return <div className={"std-list-item"}>{props.value}</div>
}

export function ActorTypeEditor<T extends ActorType>(props: {
  def: PropDef<T[keyof T]>
  name: keyof T
  target: PropsBase<T>
}) {
  // const selected = props.target.getPropValue('kind')
  return (
    <ListSelect
      selected={props.target.getPropValue("kind")}
      setSelected={(kind: ActorKind | undefined) => {
        if (kind) props.target.setPropValue("kind", kind)
      }}
      renderer={ActorTypeRenderer}
      data={["item", "player", "enemy"]}
      options={{}}
    />
  )
}
