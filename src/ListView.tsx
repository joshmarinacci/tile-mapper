import React from "react";

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
            return <div className={'list-item'} key={i}>
                <Cell value={v} selected={props.selected} setSelected={props.setSelected}/>
            </div>
        })}
    </div>
}
