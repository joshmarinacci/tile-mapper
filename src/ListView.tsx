import React from "react";
import {toClass} from "josh_react_util";

export function ListView<T>(props: {
    selected: T,
    setSelected: (v: T) => void,
    renderer: any,
    data: any[],
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
