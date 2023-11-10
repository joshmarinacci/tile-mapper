import "./treeview.css"

import { toClass } from "josh_react_util"
import React, { MouseEvent, useContext, useState } from "react"

import { calculate_context_actions } from "../actions/actions"
import {
  AddActorToDocButton,
  AddCanvasToDocButton,
  AddFontToDocButton,
  AddMapToDocButton,
  AddParticleFXToDocButton,
  AddSheetToDocButton,
  AddSoundFXToDocButton,
} from "../actions/reactactions"
import { PropsBase, useWatchProp } from "../model/base"
import { Camera } from "../model/camera"
import { StateContext } from "../model/contexts"
import { Actor, GameMap, PixelFont, Sheet, SImage } from "../model/datamodel"
import { GameDoc } from "../model/gamedoc"
import { ParticleFX } from "../model/particlefx"
import { PhysicsSettings } from "../model/physicsSettings"
import { down_arrow_triangle, Icons, right_arrow_triangle } from "./common"
import { DropdownButton, Icon, MenuList, ToolbarActionButton } from "./common-components"
import { PopupContext } from "./popup"

function PropertyList<T, K extends keyof T>(props: {
  target: PropsBase<T>
  value: T[K]
  name: keyof T
}) {
  const { value, name, target } = props
  // const values = value as []
  const [open, setOpen] = useState(true)
  const toggle = () => setOpen(!open)
  useWatchProp(target, name)
  return (
    <li className={"tree-item"}>
      <p key={"section-description"} className={"section"}>
        <button onClick={() => toggle()}>
          {open ? down_arrow_triangle : right_arrow_triangle}
        </button>
        <b>{name.toString()}</b>
        <DropdownButton title={"..."}>
          {name === "sheets" && <AddSheetToDocButton />}
          {name === "maps" && <AddMapToDocButton />}
          {name === "actors" && <AddActorToDocButton />}
          {name === "canvases" && <AddCanvasToDocButton />}
          {name === "fonts" && <AddFontToDocButton />}
          {name === "assets" && <AddSoundFXToDocButton />}
          {name === "assets" && <AddParticleFXToDocButton />}
        </DropdownButton>
      </p>
      {open && (
        <ul key={"children"} className={"tree-list"}>
          {Array.isArray(value) &&
            (value as []).map((val) => {
              return <ObjectTreeView key={val.getUUID()} obj={val} />
            })}
        </ul>
      )}
    </li>
  )
}

function TreeObjectIcon(props: { obj: PropsBase<T> }) {
  const { obj } = props
  if (obj instanceof Sheet) return <Icon name={Icons.Sheet} />
  if (obj instanceof GameMap) return <Icon name={Icons.Sheet} />
  if (obj instanceof Camera) return <Icon name={Icons.Camera} />
  if (obj instanceof PhysicsSettings) return <Icon name={Icons.Camera} />
  if (obj instanceof Actor) return <Icon name={Icons.Actor} />
  if (obj instanceof SImage) return <Icon name={Icons.Image} />
  if (obj instanceof PixelFont) return <Icon name={Icons.Font} />
  if (obj instanceof ParticleFX) return <Icon name={Icons.ParticleEffect} />
  if (obj instanceof GameDoc) return <Icon name={Icons.Document} />
  return <Icon name={Icons.Object} />
}

function TreeObjectView(props: { obj: PropsBase<T> }) {
  const { obj } = props
  const state = useContext(StateContext)
  const pm = useContext(PopupContext)
  const select = (e: MouseEvent<HTMLElement>) => {
    e.preventDefault()
    e.stopPropagation()
    state.setSelectionTarget(obj)
  }
  const showContextMenu = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault()
    select(e)
    const actions = calculate_context_actions(obj)
    const items = actions.map((act) => <ToolbarActionButton action={act} />)
    pm.show_at(<MenuList>{items}</MenuList>, e.target, "right")
  }
  return (
    <p className={"description"} onClick={select} onContextMenu={showContextMenu}>
      <TreeObjectIcon obj={obj} />
      &nbsp;
      {obj.getPropValue("name" as keyof T) as string}
    </p>
  )
}

export function ObjectTreeView<T>(props: { obj: PropsBase<T> }) {
  const { obj } = props
  const state = useContext(StateContext)
  if (!obj.getAllPropDefs) {
    console.log(obj)
    throw new Error(`trying to render an invalid object ${obj.constructor.name}`)
  }
  const expandable = obj.getAllPropDefs().filter(([, b]) => b.expandable)
  const selected = state.getSelectionPath().contains(obj)
  const style = {
    "tree-object": true,
    selected: selected,
  }
  useWatchProp(obj, "name" as keyof T)
  return (
    <ul key={obj._id} className={toClass(style)}>
      <TreeObjectView key={obj._id + "description"} obj={obj} />
      {obj instanceof GameDoc && <ObjectTreeView obj={obj.getPropValue("camera")} />}
      {obj instanceof GameDoc && <ObjectTreeView obj={obj.getPropValue("physics")} />}
      {expandable.map(([key]) => {
        return (
          <PropertyList
            key={key.toString()}
            target={obj}
            value={obj.getPropValue(key)}
            name={key}
          />
        )
      })}
    </ul>
  )
}
