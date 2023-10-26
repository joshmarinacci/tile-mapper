import React from "react"

import { Icons } from "../common/common"
import { Icon } from "../common/common-components"
import { ListViewRenderer } from "../common/ListView"
import { PropsBase, useWatchProp } from "../model/base"
import { ImageLayerType, ImageObjectLayer, ImagePixelLayer } from "../model/datamodel"

export const LayerItemRenderer: ListViewRenderer<PropsBase<ImageLayerType>, never> = (props: {
  value: PropsBase<ImageLayerType>
  selected: boolean
  options: never
}) => {
  const { value } = props
  const name = value.getPropValue("name")
  const opacity = value.getPropValue("opacity")
  const visible = value.getPropValue("visible")
  useWatchProp(value, "name")
  useWatchProp(value, "visible")
  useWatchProp(value, "opacity")
  return (
    <div className={"std-list-item"} style={{ justifyContent: "space-between" }}>
      {value instanceof ImagePixelLayer && <Icon name={Icons.PixelLayer} />}
      {value instanceof ImageObjectLayer && <Icon name={Icons.ObjectLayer} />}
      <b>{name}</b>
      <i>{opacity.toFixed(2)}</i>
      <Icon
        onClick={() => value.setPropValue("visible", !value.getPropValue("visible"))}
        name={visible ? Icons.EyeOpen : Icons.EyeClosed}
      />
    </div>
  )
}
