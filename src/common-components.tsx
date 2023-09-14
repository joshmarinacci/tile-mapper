import {toClass} from "josh_react_util"
import React, {ReactNode, useState} from "react"

export function EditableLabel(props: { onChange: (str: string) => void, value: string }) {
    const [editing, setEditing] = useState(false)
    const [value, setValue] = useState(props.value)
    if (editing) {
        return <input type={'text'} value={value}
                      onChange={(e) => setValue(e.target.value)}
                      onKeyDown={e => {
                          if (e.key === 'Enter') {
                              props.onChange(value)
                              setEditing(false)
                          }
                      }}
        />
    } else {
        return <label
            onDoubleClick={() => setEditing(true)}>{props.value}</label>
    }
}

function ToggleButton<T>(props: {
    value: T,
    selected: T,
    children: ReactNode,
    onSelect: (value: T) => void
}) {
    return <button className={toClass({
        selected: props.value === props.selected
    })}
                   onClick={() => props.onSelect(props.value)}
    >{props.children}</button>
}

export function ToggleButtonSet<T>(props: {
    values: T[],
    selected: T,
    onSelect: (mode: T) => void
}) {
    return <>
        {props.values.map(val => {
            return <ToggleButton value={val} selected={props.selected}
                                 onSelect={props.onSelect}>{""+val}</ToggleButton>
        })}
    </>
}
