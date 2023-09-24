import React from "react"

import {PropsBase} from "./base"

export type ListSelectRenderer<T> = (value:T) => string

function DefaultRenderer<T extends PropsBase<any>>(value:T)  {
    if(value) return value._id
    return "unknown"
}

export function ListSelect<T extends PropsBase<any>>(props:{
    selected: T|undefined,
    setSelected: (v: T|undefined) => void,
    renderer: ListSelectRenderer<T>|undefined,
    data: T[],
    }):JSX.Element {
    const {selected, setSelected, data, renderer} = props
    const rend = renderer || DefaultRenderer
    const value = selected?selected._id:"nothing"
    return <select value={value}
                   onChange={(e) => {
                       setSelected(data.find(v => v._id === e.target.value))
                   }}
            >
        {!selected && <option key={'nothing'} value={'nothing'}>unselected</option>}
        {
            data.map((act:T) => {
                const val = act?rend(act):"unknown"
                return <option key={act._id} value={act._id}>{val}</option>
            })
        }
    </select>

}
