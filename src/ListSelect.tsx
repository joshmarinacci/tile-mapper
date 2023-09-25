import {HBox, PopupContext} from "josh_react_util"
import React, {JSX, MouseEvent,useContext} from "react"

import {PropsBase} from "./base"
import {down_arrow_triangle} from "./common"
import {DefaultListViewRenderer, ListViewOptions, ListViewRenderer} from "./ListView"

function SelectionList<T extends PropsBase<unknown>>(props:{
    data:T[],
    selected: T|undefined,
    setSelected: (v: T|undefined) => void,
    renderer: ListViewRenderer<T>,
    options: ListViewOptions,
    }) {
    const Cell = props.renderer
    const choose = (v:T) => props.setSelected(v)
    return <div className={'list-view vertical-fill'}>
        {props.data.map((v, i) => <div className={'list-item'} key={i} onClick={()=>choose(v)}>
            <Cell key={i} value={v} selected={false} options={props.options}/>
        </div>)}
    </div>
}

export function ListSelect<T extends PropsBase<unknown>>(props:{
    selected: T|undefined,
    setSelected: (v: T|undefined) => void,
    renderer: ListViewRenderer<T>|undefined,
    data: T[],
    options: ListViewOptions,
    }):JSX.Element {
    const {selected, setSelected, data, renderer, options} = props
    const Cell = renderer || DefaultListViewRenderer
    const pm =useContext(PopupContext)
    const showDropdown = (e:MouseEvent<HTMLButtonElement>) => {
        pm.show_at(<SelectionList data={data} renderer={Cell} selected={selected} setSelected={setSelected} options={options}/>,e.target,"below")
    }
    return <button onClick={showDropdown} className={'list-select-button'}>
        <HBox>
            <Cell value={selected} selected={false} options={options}/>
            {down_arrow_triangle}
            </HBox>
    </button>
}
