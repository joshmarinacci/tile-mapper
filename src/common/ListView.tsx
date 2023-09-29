import "./ListView.css"

import {toClass} from "josh_react_util"
import React from "react"

export type ListViewOptions = Record<string, unknown>;
export type ListViewRenderer<T, O extends ListViewOptions> = (props:{value:T, selected:boolean, options:O}) => JSX.Element;

export function DefaultListViewRenderer<T>(props:{value:T, selected:boolean, options:ListViewOptions})  {
    if(props.value) <div>{props.value + ""}</div>
    return <div>unknown</div>
}
export enum ListViewDirection {
    HorizontalWrap='horizontal-wrap',
    VerticalFill='vertical-fill'
}

export function ListView<T,O extends ListViewOptions>(props: {
    selected: T|undefined,
    setSelected: (v: T) => void,
    renderer: ListViewRenderer<T,O>|undefined,
    data: T[],
    style?: object
    className:string,
    direction: ListViewDirection,
    options:O
}) {
    const Cell = props.renderer || DefaultListViewRenderer
    return <div className={`list-view ${props.className} ${props.direction}`} style={props.style}>
        {props.data.map((v, i) => {
            return <div className={toClass({
                'list-item':true,
                selected:props.selected === v
            })} key={i} onClick={()=>props.setSelected(v)}>
                <Cell value={v} selected={props.selected===v} options={props.options}/>
            </div>
        })}
    </div>
}
