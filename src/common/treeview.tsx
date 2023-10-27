import "./treeview.css"

import { Bounds, Size } from "josh_js_util"
import { DialogContext, toClass } from "josh_react_util"
import React, { MouseEvent, ReactNode, useContext, useState } from "react"

import {
  DeleteActorAction,
  DeleteGameTestAction,
  DeleteMapAction,
  DeleteSheetAction,
} from "../actions/actions"
import { AddImageDialog } from "../actions/AddImageDialog"
import {
  AddActorToDocButton,
  AddCanvasToDocButton,
  AddFontToDocButton,
  AddMapToDocButton,
  AddSheetToDocButton,
  AddTestToDocButton,
} from "../actions/reactactions"
import { appendToList, PropDef, PropsBase, useWatchProp } from "../model/base"
import { DocContext, StateContext } from "../model/contexts"
import {
  Actor,
  GameMap,
  GameTest,
  ImagePixelLayer,
  PixelFont,
  PixelGlyph,
  Sheet,
  SImage,
} from "../model/datamodel"
import { down_arrow_triangle, right_arrow_triangle } from "./common"
import { DropdownButton, MenuList, ToolbarActionButton } from "./common-components"
import { PopupContext } from "./popup"

function PropertyList<T, K extends keyof T>(props: {
  target: PropsBase<T>
  value: T[K]
  name: keyof T
  def: PropDef<T[K]>
  selection: unknown
}) {
  const { value, name, target } = props
  const values = value as []
  const [open, setOpen] = useState(true)
  const toggle = () => setOpen(!open)
  useWatchProp(target, name)
  const doc = useContext(DocContext)
  const state = useContext(StateContext)

  const dm = useContext(DialogContext)

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
          {name === "tests" && <AddTestToDocButton />}
          {name === "actors" && <AddActorToDocButton />}
          {name === "canvases" && <AddCanvasToDocButton />}
          {name === "fonts" && <AddFontToDocButton />}
          {/*<button onClick={() => add()}>Add</button>*/}
        </DropdownButton>
      </p>
      {open && (
        <ul key={"children"} className={"tree-list"}>
          {values.map((val) => {
            return <ObjectTreeView key={val.getUUID()} obj={val} selection={props.selection} />
          })}
        </ul>
      )}
    </li>
  )
}

export function ObjectTreeView<T>(props: { obj: PropsBase<T>; selection: unknown }) {
  const { obj } = props
  const state = useContext(StateContext)
  const select = (e: MouseEvent<HTMLElement>) => {
    e.preventDefault()
    e.stopPropagation()
    state.setSelection(obj)
  }
  if (!obj.getAllPropDefs) {
    console.log(obj)
    throw new Error(`trying to render an invalid object ${obj.constructor.name}`)
  }
  const expandable = obj.getAllPropDefs().filter(([, b]) => b.expandable)
  const style = {
    "tree-object": true,
    selected: state.getPropValue("selection") === obj,
  }
  useWatchProp(obj, "name" as keyof T)
  const pm = useContext(PopupContext)
  const showContextMenu = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault()
    select(e)
    const items: ReactNode[] = []
    if (obj instanceof Sheet) {
      items.push(<ToolbarActionButton key={"delete-sheet"} action={DeleteSheetAction} />)
    }
    if (obj instanceof GameMap) {
      items.push(<ToolbarActionButton key={"delete-map"} action={DeleteMapAction} />)
    }
    if (obj instanceof Actor) {
      items.push(<ToolbarActionButton key="delete-actor" action={DeleteActorAction} />)
    }
    if (obj instanceof GameTest) {
      items.push(<ToolbarActionButton key="delete-test" action={DeleteGameTestAction} />)
    }
    pm.show_at(<MenuList>{items}</MenuList>, e.target, "right")
  }
  return (
    <ul key={obj._id} className={toClass(style)}>
      <p
        key={obj._id + "description"}
        className={"description"}
        onClick={select}
        onContextMenu={showContextMenu}
      >
        {obj.getPropValue("name" as keyof T) as string}
      </p>
      {expandable.map(([key, def]) => {
        return (
          <PropertyList
            key={key.toString()}
            target={obj}
            value={obj.getPropValue(key)}
            name={key}
            def={def}
            selection={props.selection}
          />
        )
      })}
    </ul>
  )
}
