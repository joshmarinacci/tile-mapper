import { HBox } from "josh_react_util"
import React, { JSX, useContext, useRef } from "react"

import { down_arrow_triangle } from "./common"
import {
  DefaultListViewRenderer,
  ListViewOptions,
  ListViewRenderer,
} from "./ListView"
import { PopupContext } from "./popup"

function SelectionList<T, O extends ListViewOptions>(props: {
  data: T[];
  selected: T | undefined;
  setSelected: (v: T | undefined) => void;
  renderer: ListViewRenderer<T, O>;
  options: O;
}) {
  const Cell = props.renderer
  const choose = (v: T) => props.setSelected(v)
  return (
    <div className={"menu-list"}>
      {props.data.map((v, i) => (
        <div className={"list-item"} key={i} onClick={() => choose(v)}>
          <Cell key={i} value={v} selected={false} options={props.options} />
        </div>
      ))}
    </div>
  )
}

export function ListSelect<T, O extends ListViewOptions>(props: {
  selected: T | undefined;
  setSelected: (v: T | undefined) => void;
  renderer: ListViewRenderer<T, O> | undefined;
  data: T[];
  options: O;
}): JSX.Element {
  const { selected, setSelected, data, renderer, options } = props
  const Cell = renderer || DefaultListViewRenderer
  const pm = useContext(PopupContext)
  const ref = useRef(null)
  const showDropdown = () => {
    if (!ref.current) return
    pm.show_at(
      <SelectionList
        data={data}
        renderer={Cell}
        selected={selected}
        setSelected={setSelected}
        options={options}
      />,
      ref.current,
      "right",
    )
  }
  return (
    <button onClick={showDropdown} className={"list-select-button"} ref={ref}>
      <HBox>
        <Cell value={selected} selected={false} options={options} />
        {down_arrow_triangle}
      </HBox>
    </button>
  )
}
