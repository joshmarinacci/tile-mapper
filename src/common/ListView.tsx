import "./ListView.css"

import { toClass } from "josh_react_util"
import React, { ReactElement } from "react"

export type ListViewOptions = Record<string, unknown>
export type ListViewRenderer<T, O extends ListViewOptions> = (props: {
  value: T | undefined
  selected: boolean
  options: O
}) => ReactElement

export function DefaultListViewRenderer<T>(props: {
  value: T | undefined
  selected: boolean
  options: ListViewOptions
}) {
  if (props.value) return <div>{props.value + ""}</div>
  return <div>unknown</div>
}
export enum ListViewDirection {
  HorizontalWrap = "horizontal-wrap",
  VerticalFill = "vertical-fill",
}

export function ListView<T, O extends ListViewOptions>(props: {
  selected: T | undefined
  setSelected: (v: T | undefined) => void
  renderer: ListViewRenderer<T, O> | undefined
  data: T[]
  style?: object
  className: string
  direction: ListViewDirection
  options: O
}) {
  const Cell = props.renderer || DefaultListViewRenderer
  return (
    <div className={`list-view ${props.className} ${props.direction}`} style={props.style}>
      {props.data.map((v, i) => {
        const key = v.getUUID ? v.getUUID() : i + ""
        return (
          <div
            className={toClass({
              "list-item": true,
              selected: props.selected === v,
            })}
            key={key}
            onClick={() => props.setSelected(v)}
          >
            <Cell value={v} selected={props.selected === v} options={props.options} />
          </div>
        )
      })}
    </div>
  )
}
