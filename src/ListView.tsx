import {toClass} from "josh_react_util"
import React from "react"

export type ListViewRenderer = (v:T) => JSX.Element;

export function ListView<T>(props: {
    selected: T|undefined,
    setSelected: (v: T) => void,
    renderer: ListViewRenderer,
    data: T[],
    style: object
    className:string
}) {
    const Cell = props.renderer
    return <div className={`list-view ${props.className}`} style={props.style}>
        {props.data.map((v, i) => {
            return <div className={toClass({
                'list-item':true,
                selected:props.selected === v
            })} key={i}>
                <Cell value={v} index={i} selected={props.selected} setSelected={props.setSelected}/>
            </div>
        })}
    </div>
}
