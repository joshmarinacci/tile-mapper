import { DialogContext, Spacer } from "josh_react_util"
import React, { useContext } from "react"

import {
  add_actor_layer,
  add_tile_layer,
  delete_map_layer,
  move_layer_down,
  move_layer_up,
} from "../actions/actions"
import { DropdownButton, Icon, IconButton, Pane } from "../common/common-components"
import { Icons } from "../common/icons"
import { ListView, ListViewDirection, ListViewRenderer } from "../common/ListView"
import { PropsBase, useWatchProp } from "../model/base"
import { GameMap, MapLayerType, TileLayer } from "../model/gamemap"
import { ResizeLayerDialog } from "./ResizeLayerDialog"

const LayerNameRenderer: ListViewRenderer<PropsBase<MapLayerType>, never> = (props: {
  value: PropsBase<MapLayerType> | undefined
  selected: boolean
  options: never
}) => {
  const { value } = props
  if (!value) return <div className={"std-list-item"}>missing</div>
  useWatchProp(value, "name")
  useWatchProp(value, "visible")
  return (
    <div className={"std-list-item"} style={{ justifyContent: "space-between" }}>
      <b>{value.getPropValue("name")}</b>
      <Icon
        onClick={() => value.setPropValue("visible", !value.getPropValue("visible"))}
        name={value.getPropValue("visible") ? Icons.EyeOpen : Icons.EyeClosed}
      />
    </div>
  )
}

export function LayerList(props: {
  setSelectedLayer: (value: PropsBase<MapLayerType> | undefined) => void
  map: GameMap
  editable: boolean
  layer: PropsBase<MapLayerType> | undefined
}) {
  const { layer } = props
  const dm = useContext(DialogContext)
  useWatchProp(props.map, "layers")
  const resize = () => {
    if (layer instanceof TileLayer) dm.show(<ResizeLayerDialog layer={layer} />)
  }

  return (
    <Pane className={"layer-list-view"} collapsable={true} title={"Layers"}>
      {props.editable && (
        <div className={"toolbar"}>
          <button onClick={() => add_tile_layer(props.map)}>
            + <Icon name={Icons.Tile} />
          </button>
          <button onClick={() => add_actor_layer(props.map)}>
            + <Icon name={Icons.Actor} />
          </button>
          <button onClick={() => move_layer_up(layer, props.map)}>
            <Icon name={Icons.DownArrow} />
          </button>
          <button onClick={() => move_layer_down(layer, props.map)}>
            <Icon name={Icons.UpArrow} />
          </button>
          <Spacer />
          <DropdownButton icon={Icons.Gear}>
            <IconButton onClick={() => resize()} icon={Icons.Resize} text={"resize layer"} />
            <IconButton
              onClick={() => delete_map_layer(layer, props.map)}
              icon={Icons.Trashcan}
              text={"delete selected layer"}
            />
          </DropdownButton>
        </div>
      )}
      <ListView
        selected={layer}
        setSelected={props.setSelectedLayer}
        renderer={LayerNameRenderer}
        data={props.map.getPropValue("layers")}
        direction={ListViewDirection.VerticalFill}
        className={"sheet-list"}
        options={undefined as never}
      />
    </Pane>
  )
}
