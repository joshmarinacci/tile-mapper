import {toClass} from "josh_react_util"
import React, {ReactNode, useEffect, useState} from "react"

import {Observable} from "./model"

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
            onDoubleClick={e => setEditing(true)}>{props.value}</label>
    }
}

export function useObservableChange(ob: Observable | undefined, eventType: string) {
    const [count, setCount] = useState(0)
    return useEffect(() => {
        const hand = () => {
            setCount(count + 1)
        }
        if (ob) ob.addEventListener(eventType, hand)
        return () => {
            if (ob) ob.removeEventListener(eventType, hand)
        }

    }, [ob, count])
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
