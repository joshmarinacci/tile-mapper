import React from "react"

import { Icon } from "../common/common-components"
import { Icons } from "../common/icons"
import { ListViewRenderer } from "../common/ListView"
import { PropsBase, useWatchProp } from "../model/base"
import { ImageLayerType, ImageObjectLayer, ImagePixelLayer } from "../model/datamodel"

export const LayerItemRenderer: ListViewRenderer<PropsBase<ImageLayerType>, never> = (props: {
  value: PropsBase<ImageLayerType> | undefined
  selected: boolean
  options: never
}) => {
  const { value } = props
  if (!value) return <div className={"std-list-item"}>missing layer</div>
  const name = value.getPropValue("name")
  const opacity = value.getPropValue("opacity")
  const visible = value.getPropValue("visible")
  useWatchProp(value, "name")
  useWatchProp(value, "visible")
  useWatchProp(value, "opacity")
  const toggle = () => {
    const v = value.getPropValue("visible")
    value.setPropValue("visible", !v)
  }
  return (
    <div className={"std-list-item"} style={{ justifyContent: "space-between" }}>
      {value instanceof ImagePixelLayer && <Icon name={Icons.PixelLayer} />}
      {value instanceof ImageObjectLayer && <Icon name={Icons.ObjectLayer} />}
      <b>{name}</b>
      <i>{opacity.toFixed(2)}</i>
      <Icon onClick={toggle} name={visible ? Icons.EyeOpen : Icons.EyeClosed} />
    </div>
  )
}
