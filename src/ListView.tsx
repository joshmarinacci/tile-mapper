import "./ListView.css"

import {toClass} from "josh_react_util"
import React from "react"

import {GameDoc} from "./datamodel"

export type ListViewOptions = Record<string, any>;
export type ListViewRenderer<T> = (props:{value:T, selected:boolean, index:number, doc?:GameDoc, options?:ListViewOptions}) => JSX.Element;

export function DefaultListViewRenderer<T>(props:{value:T, selected:boolean, index:number})  {
    if(props.value) <div>{props.value + ""}</div>
    return <div>unknown</div>
}
export enum ListViewDirection {
    HorizontalWrap='horizontal-wrap',
    VerticalFill='vertical-fill'
}

export function ListView<T>(props: {
    selected: T|undefined,
    setSelected: (v: T) => void,
    renderer: ListViewRenderer<T>|undefined,
    data: T[],
    style: object
    className:string,
    direction: ListViewDirection,
    options?:Record<string, any>
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
                <Cell value={v} selected={props.selected===v} index={i} options={props.options}/>
            </div>
        })}
    </div>
}
