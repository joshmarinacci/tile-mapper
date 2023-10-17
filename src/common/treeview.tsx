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
import { appendToList, PropDef, PropsBase, useWatchProp } from "../model/base"
import {
  Actor,
  DocType,
  GameDoc,
  GameMap,
  GameTest,
  Sheet,
  SImage,
  SImageLayer,
} from "../model/datamodel"
import { GlobalState } from "../state"
import { down_arrow_triangle, right_arrow_triangle } from "./common"
import {
  DropdownButton,
  MenuList,
  ToolbarActionButton,
} from "./common-components"
import { PopupContext } from "./popup"

function AddSImageDialog(props: { onComplete: (size: Size) => void }) {
  const dm = useContext(DialogContext)
  const [width, setWidth] = useState(16)
  const [height, setHeight] = useState(16)
  return (
    <div className={"dialog"}>
      <header>create new drawing canvas</header>
      <section className={"standard-form"}>
        <label>width</label>{" "}
        <input
          type={"number"}
          value={width}
          onChange={(e) => setWidth(parseInt(e.target.value))}
        />
        <label>height</label>{" "}
        <input
          type={"number"}
          value={height}
          onChange={(e) => setHeight(parseInt(e.target.value))}
        />
      </section>
      <footer>
        <button
          onClick={() => {
            dm.hide()
          }}
        >
          cancel
        </button>
        <button
          onClick={() => {
            dm.hide()
            props.onComplete(new Size(width, height))
          }}
        >
          create
        </button>
      </footer>
    </div>
  )
}

function PropertyList<T, K extends keyof T>(props: {
  target: PropsBase<T>;
  value: GameDoc[];
  name: keyof T;
  state: GlobalState;
  def: PropDef<T[K]>;
  selection: unknown;
}) {
  const { value, name, target } = props
  const values = value as []
  const [open, setOpen] = useState(true)
  const toggle = () => setOpen(!open)
  useWatchProp(target, name)
  const addSheet = () => {
    const sheet = new Sheet({
      name: "unnamed sheet",
      tileSize: target.getPropValue("tileSize"),
    })
    appendToList(target, "sheets", sheet)
    props.state.setPropValue("selection", sheet)
  }
  const addMap = () => {
    const map = new GameMap({ name: "new map" })
    appendToList(target, "maps", map)
    props.state.setPropValue("selection", map)
  }
  const addActor = () => {
    const size = new Size(16, 16)
    const sprite = new SImage({ name: "new actor sprite", size: size })
    const layer = new SImageLayer({
      name: "layer",
      opacity: 1.0,
      visible: true,
    })
    const bounds = new Bounds(0, 0, size.w, size.h)
    layer.rebuildFromCanvas(sprite)
    appendToList(sprite, "layers", layer)
    appendToList(target, "canvases", sprite)
    const actor = new Actor({
      name: "new actor",
      viewbox: bounds,
      hitbox: bounds,
      sprite: sprite.getUUID(),
    })
    appendToList(target, name, actor)
    props.state.setPropValue("selection", actor)
  }
  const addTest = () => {
    const test = new GameTest({ name: "a new test" })
    appendToList(target, name, test)
    props.state.setPropValue("selection", test)
  }

  const dm = useContext(DialogContext)
  const addCanvas = () => {
    dm.show(
      <AddSImageDialog
        onComplete={(size) => {
          const canvas = new SImage({ name: "blank canvas", size: size })
          const layer = new SImageLayer({
            name: "unnamed layer",
            opacity: 1.0,
            visible: true,
          })
          appendToList(canvas, "layers", layer)
          layer.rebuildFromCanvas(canvas)
          appendToList(target, "canvases", canvas)
          props.state.setPropValue("selection", canvas)
        }}
      />,
    )
  }

  return (
    <li className={"tree-item"}>
      <p key={"section-description"} className={"section"}>
        <button onClick={() => toggle()}>
          {open ? down_arrow_triangle : right_arrow_triangle}
        </button>
        <b>{name.toString()}</b>
        <DropdownButton title={"..."}>
          {name === "sheets" && <button onClick={addSheet}>Add Sheet</button>}
          {name === "maps" && <button onClick={addMap}>Add Map</button>}
          {name === "tests" && <button onClick={addTest}>Add Test</button>}
          {name === "actors" && <button onClick={addActor}>Add Actor</button>}
          {name === "canvases" && (
            <button onClick={addCanvas}>Add Canvas</button>
          )}
          {/*<button onClick={() => add()}>Add</button>*/}
        </DropdownButton>
      </p>
      {open && (
        <ul key={"children"} className={"tree-list"}>
          {values.map((val) => {
            return (
              <ObjectTreeView
                key={val._id}
                obj={val}
                state={props.state}
                selection={props.selection}
              />
            )
          })}
        </ul>
      )}
    </li>
  )
}

export function ObjectTreeView<T>(props: {
  obj: PropsBase<T>;
  state: GlobalState;
  selection: unknown;
}) {
  const { obj, state } = props
  const select = (e: MouseEvent<HTMLElement>) => {
    e.preventDefault()
    e.stopPropagation()
    state.setPropValue("selection", obj)
  }
  if (!obj.getAllPropDefs) {
    console.log(obj)
    throw new Error(
      `trying to render an invalid object ${obj.constructor.name}`,
    )
  }
  const expandable = obj.getAllPropDefs().filter(([a, b]) => b.expandable)
  const style = {
    "tree-object": true,
    selected: state.getPropValue("selection") === obj,
  }
  useWatchProp(obj, "name")
  const pm = useContext(PopupContext)
  const showContextMenu = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault()
    select(e)
    const items: ReactNode[] = []
    if (obj instanceof Sheet) {
      items.push(
        <ToolbarActionButton
          key={"delete-sheet"}
          state={state}
          action={DeleteSheetAction}
        />,
      )
    }
    if (obj instanceof GameMap) {
      items.push(
        <ToolbarActionButton
          key={"delete-map"}
          state={state}
          action={DeleteMapAction}
        />,
      )
    }
    if (obj instanceof Actor) {
      items.push(
        <ToolbarActionButton
          key="delete-actor"
          state={state}
          action={DeleteActorAction}
        />,
      )
    }
    if (obj instanceof GameTest) {
      items.push(
        <ToolbarActionButton
          key="delete-test"
          state={state}
          action={DeleteGameTestAction}
        />,
      )
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
        {obj.getPropValue("name") as string}
      </p>
      {expandable.map(([key, def]) => {
        return (
          <PropertyList
            key={key.toString()}
            target={obj}
            value={obj.getPropValue(key)}
            name={key}
            state={state}
            def={def}
            selection={props.selection}
          />
        )
      })}
    </ul>
  )
}
