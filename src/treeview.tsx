import "./treeview.css"

import {toClass} from "josh_react_util"
import React, {useState} from "react"

import {PropDef, PropsBase, useWatchProp} from "./base"
import {GlobalState} from "./state"

function PropertyList<T, K extends keyof T>(props: {
    target: PropsBase<T>,
    value: T[K],
    name: K,
    state: GlobalState,
    def: PropDef<T[K]>
}) {
    const {value, name, def, target} = props
    const values = value as []
    const [open, setOpen] = useState(true)
    const toggle = () => setOpen(!open)
    return <li className={'tree-item'}>
        <p className={'section'}>
            <button onClick={() => toggle()}>{open?'-':'+'}</button>
            {name}
        </p>
        {open &&
        <ul className={'tree-list'}>{values.map((val, i) => {
            return <ObjectTreeView obj={val} state={props.state}/>
        })}</ul>}
    </li>
}

function PropertyItem<T, K extends keyof T>(props: {
    target: PropsBase<T>,
    value: T[K],
    name: K,
    state: GlobalState,
    def: PropDef<T[K]>
}) {
    const {target, value, name, state, def} = props
    return <li className={'tree-item'}>
        {name} <b>{def.format(target.getPropValue(name))}</b> <i>{def.type}</i>
    </li>

}

export function ObjectTreeView<T>(props: {
    obj: PropsBase<T>,
    state: GlobalState,
    selection: unknown
}) {
    const {obj, state} = props
    const select = (e) => {
        e.preventDefault()
        e.stopPropagation()
        state.setPropValue('selection', obj)
    }
    const expandable = obj.getAllPropDefs()
        .filter(([a,b])=> b.expandable)
    const style = {
        'tree-object':true,
        selected: state.getPropValue('selection') === obj,
    }
    return <ul className={toClass(style)}>
        <p className={'description'} onClick={select}>{obj.getPropValue('name')+""}
        </p>
        {
            expandable.map(([key, def]) => {
                return <PropertyList key={key} target={obj}
                                     value={obj.getPropValue(key)} name={key}
                                     state={state} def={def}/>
            })
        }
    </ul>
}
