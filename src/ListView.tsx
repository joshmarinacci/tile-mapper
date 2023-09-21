import "./ListView.css"

import {toClass} from "josh_react_util"
import React from "react"

export type ListViewRenderer<T> = (props:{value:T, selected:boolean, index:number}) => JSX.Element;

function DefaultRenderer(props:{})  {
    return <div>default</div>
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
    direction: ListViewDirection
}) {
    const Cell = props.renderer || DefaultRenderer
    return <div className={`list-view ${props.className} ${props.direction}`} style={props.style}>
        {props.data.map((v, i) => {
            return <div className={toClass({
                'list-item':true,
                selected:props.selected === v
            })} key={i}
                        onClick={()=>props.setSelected(v)}
            >
                <Cell value={v} selected={props.selected===v} index={i}/>
            </div>
        })}
    </div>
}
