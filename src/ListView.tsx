import "./ListView.css"

import {toClass} from "josh_react_util"
import React from "react"

export type ListViewOptions = Record<string, unknown>;
export type ListViewRenderer<T> = (props:{value:T, selected:boolean, options:ListViewOptions}) => JSX.Element;

export function DefaultListViewRenderer<T>(props:{value:T, selected:boolean})  {
    if(props.value) <div>{props.value + ""}</div>
    return <div>unknown</div>
}
export enum ListViewDirection {
    HorizontalWrap='horizontal-wrap',
    VerticalFill='vertical-fill'
}

export function ListView<T>(props: {
    selected: T|undefined,
    setSelected: (v: T|undefined) => void,
    renderer: ListViewRenderer<T>|undefined,
    data: T[],
    style: object
    className:string,
    direction: ListViewDirection,
    options:ListViewOptions
}) {
    const Cell = props.renderer || DefaultListViewRenderer
    return <div className={`list-view ${props.className} ${props.direction}`} style={props.style}>
        {props.data.map((v, i) => {
            return <div className={toClass({
                'list-item':true,
                selected:props.selected === v
            })} key={i}
                        onClick={()=>props.setSelected(v)}
            >
                <Cell value={v} selected={props.selected===v} options={props.options}/>
            </div>
        })}
    </div>
}
