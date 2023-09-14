import {toClass} from "josh_react_util"
import React from "react"

export type ListViewRenderer<T> = (props:{value:T, selected:boolean, index:number}) => JSX.Element;

export function ListView<T>(props: {
    selected: T|undefined,
    setSelected: (v: T) => void,
    renderer: ListViewRenderer<T>,
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
            })} key={i}
                        onClick={()=>props.setSelected(v)}
            >
                <Cell value={v} selected={props.selected===v} index={i}/>
            </div>
        })}
    </div>
}
