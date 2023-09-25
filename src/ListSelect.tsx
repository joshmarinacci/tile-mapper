import {HBox, PopupContext, VBox} from "josh_react_util"
import React, {JSX, useContext} from "react"

import {PropsBase} from "./base"
import {down_arrow_triangle} from "./common"
import {GameDoc} from "./datamodel"
import {DefaultListViewRenderer, ListViewRenderer} from "./ListView"

function SelectionList<T extends PropsBase<any>>(props:{
    data:T[],
    selected: T|undefined,
    setSelected: (v: T|undefined) => void,
    renderer: ListViewRenderer<T>,
    doc?:GameDoc }) {
    const Cell = props.renderer
    const choose = (v:T) => props.setSelected(v)
    return <div className={'list-view vertical-fill'}>
        {props.data.map((v, i) => <div className={'list-item'} key={i} onClick={()=>choose(v)}><Cell key={i} value={v} doc={props.doc}/></div>)}
    </div>
}

export function ListSelect<T extends PropsBase<any>>(props:{
    selected: T|undefined,
    setSelected: (v: T|undefined) => void,
    renderer: ListViewRenderer<T>|undefined,
    data: T[],
    doc?:GameDoc
    }):JSX.Element {
    const {selected, setSelected, data, renderer} = props
    const Cell = renderer || DefaultListViewRenderer
    const pm =useContext(PopupContext)
    const showDropdown = (e) => {
        pm.show_at(<SelectionList data={data} renderer={Cell} selected={selected} setSelected={setSelected} doc={props.doc} />,e.target,"below")
    }
    return <button onClick={showDropdown} className={'list-select-button'}>
        <HBox>
            <Cell value={selected} selected={false} index={0} doc={props.doc}/>
            {down_arrow_triangle}
            </HBox>
    </button>
}
