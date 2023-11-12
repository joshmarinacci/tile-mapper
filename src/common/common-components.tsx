import "./common.css"

import { toClass } from "josh_react_util"
import React, { ReactNode, useContext, useState } from "react"

import { MenuAction, SimpleMenuAction } from "../actions/actions"
import { ICON_CACHE } from "../iconcache"
import { PropsBase } from "../model/base"
import { StateContext } from "../model/contexts"
import { GlobalState } from "../state"
import { down_arrow_triangle } from "./common"
import { Icons } from "./icons"
import { PopupContext } from "./popup"

export function EditableLabel(props: { onChange: (str: string) => void; value: string }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(props.value)
  if (editing) {
    return (
      <input
        type={"text"}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            props.onChange(value)
            setEditing(false)
          }
        }}
      />
    )
  } else {
    return <label onDoubleClick={() => setEditing(true)}>{props.value}</label>
  }
}

// function ToggleButton<T>(props: {
//     value: T,
//     selected: T,
//     children: ReactNode,
//     onSelect: (value: T) => void
// }) {
//     return <button className={toClass({
//         selected: props.value === props.selected
//     })}
//                    onClick={() => props.onSelect(props.value)}
//     >{props.children}</button>
// }

// export function ToggleButtonSet<T>(props: {
//     values: T[],
//     selected: T,
//     onSelect: (mode: T) => void
// }) {
//     return <>
//         {props.values.map(val => {
//             return <ToggleButton value={val} selected={props.selected}
//                                  onSelect={props.onSelect}>{""+val}</ToggleButton>
//         })}
//     </>
// }

export interface ReactMenuAction extends MenuAction {
  type: "react"
  makeComponent: (state: GlobalState) => JSX.Element
}

export function ToolbarActionButton(props: {
  action: MenuAction
  disabled?: boolean
}): JSX.Element {
  const state = useContext(StateContext)
  const { action, disabled = false } = props
  if (action.type === "react") {
    return (action as ReactMenuAction).makeComponent(state) as JSX.Element
  }
  const icon = action.icon ? <Icon name={action.icon} /> : ""
  const perform = async () => {
    if (action.type === "simple") await (action as SimpleMenuAction).perform(state)
  }
  return (
    <button className={"menu-button"} onClick={perform} disabled={disabled}>
      {" "}
      {icon} {action.title}
    </button>
  )
}

export function MenuList(props: { children: ReactNode }) {
  return <div className={"menu-list"}>{props.children}</div>
}
export function DropdownButton(props: { title?: string; icon?: Icons; children: ReactNode }) {
  const { title, icon, children } = props
  const pm = useContext(PopupContext)
  return (
    <button
      onClick={(e) => {
        pm.show_at(<MenuList>{children}</MenuList>, e.target, "right")
      }}
    >
      {icon ? <Icon name={icon} /> : ""}
      {title ? title : ""} {down_arrow_triangle}
    </button>
  )
}

export function Pane(props: {
  title?: string
  header?: ReactNode
  children: ReactNode
  collapsable?: boolean
  className?: string
}) {
  const { collapsable, className, title } = props
  const [hide, setHide] = useState(false)

  if (props.collapsable) {
    return (
      <div className={`pane ${className}`}>
        <header>
          <ToggleButton
            onClick={() => setHide(!hide)}
            icon={Icons.DownArrow}
            selectedIcon={Icons.RightArrow}
            selected={hide}
          />
          <label>{title}</label>
        </header>
        <div
          className={"pane-content-wrapper"}
          style={{
            display: collapsable ? (hide ? "none" : "block") : "block",
          }}
        >
          {props.children}
        </div>
      </div>
    )
  } else {
    return (
      <div className={`pane ${className}`}>
        {props.header ? props.header : props.title && <header>{props.title}</header>}
        <div
          className={"pane-content-wrapper"}
          style={{
            display: props.collapsable ? (hide ? "none" : "block") : "block",
          }}
        >
          {props.children}
        </div>
      </div>
    )
  }
}

export function Icon(props: { name: Icons; onClick?: () => void }) {
  return (
    <img
      src={ICON_CACHE.getIconUrl(props.name)}
      onClick={props.onClick}
      width={16}
      style={{ imageRendering: "pixelated" }}
    />
  )
}

export function ToggleButton(props: {
  onClick: () => void
  icon: Icons
  selected: boolean
  selectedIcon?: Icons
  text?: string
}) {
  let icon = props.icon
  if (props.selected && props.selectedIcon) {
    icon = props.selectedIcon
  }
  return (
    <button
      onClick={props.onClick}
      className={toClass({
        selected: props.selected,
      })}
    >
      <Icon name={icon} />
      {props.text ? " " + props.text : ""}
    </button>
  )
}

export function IconButton(props: {
  onClick: () => void
  icon: Icons
  text?: string
  tooltip?: string
}) {
  return (
    <button onClick={props.onClick} data-text={props.tooltip} className={"tooltip"}>
      <Icon name={props.icon} />
      {props.text ? props.text : ""}
    </button>
  )
}

export function CheckToggleButton<T extends PropsBase<any>>(props: {
  target: T
  prop: string
  text: string
}) {
  const { target, prop, text } = props
  const selected = target.getPropValue(prop)
  return (
    <button
      onClick={() => {
        target.setPropValue(prop, !selected)
      }}
    >
      <Icon name={selected ? Icons.Checkmark : Icons.Blank} />
      {text}
    </button>
  )
}
