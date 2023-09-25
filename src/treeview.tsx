import "./treeview.css"

import {Size} from "josh_js_util"
import {toClass} from "josh_react_util"
import React, {useState} from "react"

import {appendToList, PropDef, PropsBase, useWatchProp} from "./base"
import {down_arrow_triangle, right_arrow_triangle} from "./common"
import {DropdownButton} from "./common-components"
import {Actor, GameMap, GameTest, Sheet} from "./datamodel"
import {GlobalState} from "./state"

function PropertyList<T, K extends keyof T>(props: {
    target: PropsBase<T>,
    value: T[K],
    name: K,
    state: GlobalState,
    def: PropDef<T[K]>,
    selection: unknown,
}) {
    const {value, name,  target} = props
    const values = value as []
    const [open, setOpen] = useState(true)
    const toggle = () => setOpen(!open)
    useWatchProp(target,name)
    const addSheet = () => {
        const sheet = new Sheet({name:'unnamed sheet', tileSize: new Size(20,20)})
        appendToList(target,name,sheet)
        props.state.setPropValue('selection',sheet)
    }
    const addMap = () => {
        const map = new GameMap({name:'new map'})
        appendToList(target,name,map)
        props.state.setPropValue('selection',map)
    }
    const addActor = () => {
        const actor = new Actor({name:'new actor'})
        appendToList(target,name,actor)
        props.state.setPropValue('selection',actor)
    }
    const addTest = () => {
        const test = new GameTest({name: 'a new test'})
        appendToList(target,name,test)
        props.state.setPropValue('selection',test)
    }

    return <li className={'tree-item'}>
        <p key={'section-description'} className={'section'}>
            <button onClick={() => toggle()}>{open?down_arrow_triangle:right_arrow_triangle}</button>
            <b>{name.toString()}</b>
            <DropdownButton title={"..."}>
                {name === 'sheets' && <button onClick={addSheet}>Add Sheet</button>}
                {name === 'maps' && <button onClick={addMap}>Add Map</button>}
                {name === 'tests' && <button onClick={addTest}>Add Test</button>}
                {name === 'actors' && <button onClick={addActor}>Add Actor</button>}
                {/*<button onClick={() => add()}>Add</button>*/}
            </DropdownButton>
        </p>
        {open &&
        <ul key={'children'} className={'tree-list'}>{values.map((val) => {
            return <ObjectTreeView key={val._id}
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
    return <ul key={obj._id} className={toClass(style)}>
        <p key={obj._id+'description'} className={'description'} onClick={select}>
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
