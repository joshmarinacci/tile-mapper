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
import { Actor } from "../model/actor"
import { PropsBase, useWatchProp } from "../model/base"
import { Camera } from "../model/camera"
import { DocContext, StateContext } from "../model/contexts"
import { DocType, GameDoc } from "../model/gamedoc"
import { ActorLayer, GameMap, TileLayer } from "../model/gamemap"
import { SImage } from "../model/image"
import { ParticleFX } from "../model/particlefx"
import { PhysicsSettings } from "../model/physicsSettings"
import { PixelFont } from "../model/pixelfont"
import { Sheet } from "../model/sheet"
import { SoundFX } from "../model/soundfx"
import { down_arrow_triangle, right_arrow_triangle } from "./common"
import { Icon, MenuList, ToolbarActionButton } from "./common-components"
import { Icons } from "./icons"
import { PopupContext } from "./popup"

function TreeObjectIcon<T>(props: { obj: PropsBase<T> }) {
  const { obj } = props
  if (obj instanceof Sheet) return <Icon name={Icons.Sheet} />
  if (obj instanceof GameMap) return <Icon name={Icons.Map} />
  if (obj instanceof Camera) return <Icon name={Icons.Camera} />
  if (obj instanceof PhysicsSettings) return <Icon name={Icons.Camera} />
  if (obj instanceof Actor) return <Icon name={Icons.Actor} />
  if (obj instanceof SImage) return <Icon name={Icons.Image} />
  if (obj instanceof PixelFont) return <Icon name={Icons.Font} />
  if (obj instanceof SoundFX) return <Icon name={Icons.Stop} />
  if (obj instanceof ParticleFX) return <Icon name={Icons.ParticleEffect} />
  if (obj instanceof GameDoc) return <Icon name={Icons.Document} />
  if (obj instanceof ActorLayer) return <Icon name={Icons.Actor} />
  if (obj instanceof TileLayer) return <Icon name={Icons.Tile} />
  return <Icon name={Icons.Object} />
}

function ListPropView<T, K extends keyof T>(props: { name: K; doc: PropsBase<T> }) {
  const { name, doc } = props
  const value = doc.getPropValue(name)
  const [open, setOpen] = useState(true)
  const toggle = () => setOpen(!open)
  return (
    <li className={"tree-object"}>
      <header>
        <button onClick={() => toggle()}>
          {open ? down_arrow_triangle : right_arrow_triangle}
        </button>
        <b>{name.toString()}</b>
      </header>
      {open && (
        <ul key={"children"} className={"tree-object"}>
          {Array.isArray(value) &&
            (value as PropsBase<any>[]).map((val) => {
              return <TreeObjectView key={val.getUUID()} obj={val} depth={0} />
            })}
        </ul>
      )}
    </li>
  )
}
function TreeObjectView<T>(props: { obj: PropsBase<T> }) {
  const { obj } = props
  const state = useContext(StateContext)
  const pm = useContext(PopupContext)
  const selected = state.getSelectionPath().contains(obj)

  const style = {
    "tree-object": true,
    selected: selected,
  }
  const [open, setOpen] = useState(false)
  const toggle = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setOpen(!open)
  }
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
  const expandable = Array.from(obj.getAllPropDefs().filter(([, b]) => b.expandable))
  const children = (
    <ul>
      {expandable.map((v) => (
        <ListPropView key={v[0].toString()} name={v[0]} doc={obj} />
      ))}
    </ul>
  )
  const should_expand = expandable.length > 0

  return (
    <li className={toClass(style)}>
      <header
        onClick={(e) => {
          select(e)
          if (should_expand) toggle(e)
        }}
        onContextMenu={showContextMenu}
      >
        {should_expand && (
          <button onClick={(e) => toggle(e)}>
            {open ? down_arrow_triangle : right_arrow_triangle}
          </button>
        )}
        <TreeObjectIcon obj={obj} />
        {obj.getPropValue("name" as keyof T) as string}
      </header>
      {open && should_expand && children}
    </li>
  )
}
function TreeItemView<T>(props: { obj: PropsBase<T> }) {
  const { obj } = props
  const state = useContext(StateContext)
  const pm = useContext(PopupContext)
  const selected = state.getSelectionPath().contains(obj)
  const style = {
    "tree-object": true,
    selected: selected,
  }
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
    items.push(<AddActorToDocButton />)
    items.push(<AddSheetToDocButton />)
    items.push(<AddMapToDocButton />)
    items.push(<AddCanvasToDocButton />)
    items.push(<AddFontToDocButton />)
    items.push(<AddParticleFXToDocButton />)
    items.push(<AddSoundFXToDocButton />)
    pm.show_at(<MenuList>{items}</MenuList>, e.target, "right")
  }
  useWatchProp(obj, "name" as keyof T)
  return (
    <li className={toClass(style)}>
      <header onClick={select} onContextMenu={showContextMenu}>
        <TreeObjectIcon obj={obj} />
        {obj.getPropValue("name" as keyof T) as string}
      </header>
    </li>
  )
}

function TreeSection<K extends keyof DocType>(props: { name: K; doc: GameDoc }) {
  const { name, doc } = props
  const value = doc.getPropValue(name)
  const [open, setOpen] = useState(false)
  const toggle = () => setOpen(!open)
  return (
    <li className={"tree-item"}>
      <header>
        <button onClick={() => toggle()}>
          {open ? down_arrow_triangle : right_arrow_triangle}
        </button>
        <b>{name.toString()}</b>
      </header>
      {open && (
        <ul key={"children"} className={"tree-list"}>
          {Array.isArray(value) &&
            (value as PropsBase<any>[]).map((val) => {
              return <TreeObjectView key={val.getUUID()} obj={val} depth={0} />
            })}
        </ul>
      )}
    </li>
  )
}

export function TreeView() {
  const doc = useContext(DocContext)
  return (
    <ul className={"tree-root"} key={doc.getUUID()}>
      <TreeItemView obj={doc} />
      <TreeObjectView obj={doc.getPropValue("camera")} />
      <TreeObjectView obj={doc.getPropValue("physics")} />
      <TreeSection name={"sheets"} doc={doc} />
      <TreeSection name={"maps"} doc={doc} />
      <TreeSection name={"actors"} doc={doc} />
      <TreeSection name={"canvases"} doc={doc} />
      <TreeSection name={"fonts"} doc={doc} />
      <TreeSection name={"assets"} doc={doc} />
    </ul>
  )
}
