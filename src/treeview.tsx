import "./treeview.css"

import {Size} from "josh_js_util"
import {toClass} from "josh_react_util"
import React, {useState} from "react"

import {appendToList, PropDef, PropsBase, useWatchProp} from "./base"
import {GameMap, GameTest,Sheet} from "./datamodel"
import {GlobalState} from "./state"

function PropertyList<T, K extends keyof T>(props: {
    target: PropsBase<T>,
    value: T[K],
    name: K,
    state: GlobalState,
    def: PropDef<T[K]>,
    selection: unknown,
}) {
    const {value, name, def, target} = props
    const values = value as []
    const [open, setOpen] = useState(true)
    const toggle = () => setOpen(!open)
    useWatchProp(target,name)
    const add = () => {
        if(name === 'sheets') {
            const sheet = new Sheet({name:'unnamed', tileSize: new Size(20,20)})
            appendToList(target,name,sheet)
            props.state.setPropValue('selection',sheet)
        }
        if(name === 'maps') {
            const map = new GameMap({name:name})
            appendToList(target,name,map)
            props.state.setPropValue('selection',map)
        }
        if(name === 'tests') {
            const test = new GameTest({name: 'a new test'})
            appendToList(target,name,test)
            props.state.setPropValue('selection',test)
        }
    }
    return <li className={'tree-item'}>
        <p className={'section'}>
            <button onClick={() => toggle()}>{open?'▼':'▶'}</button>
            <b>{name.toString()}</b>
            <button onClick={() => add()}>+</button>
        </p>
        {open &&
        <ul className={'tree-list'}>{values.map((val) => {
            return <ObjectTreeView
                obj={val}
                state={props.state}
                selection={props.selection}/>
        })}</ul>}
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
    if(!obj.getAllPropDefs) {
        console.log(obj)
        throw new Error(`trying to render an invalid object ${obj.constructor.name}`)
    }
    const expandable = obj.getAllPropDefs()
        .filter(([a,b])=> b.expandable)
    const style = {
        'tree-object':true,
        selected: state.getPropValue('selection') === obj,
    }
    useWatchProp(obj,'name' as keyof T)
    return <ul className={toClass(style)}>
        <p className={'description'} onClick={select}>
            {obj.getPropValue('name' as keyof T) as string}
        </p>
        {
            expandable.map(([key, def]) => {
                return <PropertyList key={key.toString()} target={obj}
                                     value={obj.getPropValue(key)}
                                     name={key}
                                     state={state} def={def}
                                     selection={props.selection}
                />
            })
        }
    </ul>
}
