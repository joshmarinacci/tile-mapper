import {PopupContext, toClass} from "josh_react_util"
import React, {ReactNode, useContext, useState} from "react"

import {ActionRegistry, MenuAction, SimpleMenuAction} from "../model/base"
import {GameDoc} from "../model/datamodel"
import {GlobalState} from "../state"

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
const AR = new ActionRegistry()
export const ActionRegistryContext =  React.createContext(AR)


export interface ReactMenuAction extends MenuAction{
    type: 'react',
    makeComponent: (state:GlobalState) => JSX.Element
}

export function ToolbarActionButton(props:{state:GlobalState, action:MenuAction,disabled?:boolean}):JSX.Element {
    const {action, disabled=false} = props
    if(action.type === 'react') {
        return  (action as ReactMenuAction).makeComponent(props.state) as JSX.Element
    }
    const icon = <></>
    // if(action.icon) {
    //     icon = <span  className="material-icons material-symbols-rounded">{action.icon}</span>
    // }
    const perform = async () => {
        if(action.type === 'simple') await (action as SimpleMenuAction).perform(props.state)
    }
    return <button className={'menu-button'} onClick={perform} disabled={disabled}> {icon} {action.title}</button>
}

export function MenuList(props: { children:ReactNode }) {
    return <div className={'menu-list'}>{props.children}</div>
}
export function DropdownButton(props: { title:string,     children: ReactNode,
}) {
    const pm = useContext(PopupContext)
    return <button onClick={(e)=>{
        pm.show_at(<MenuList>{props.children}</MenuList>,e.target,'below')
    }}>{props.title}</button>
}

export const DocContext = React.createContext(new GameDoc())

export function Pane(props:{title?:string, header?:ReactNode, children:ReactNode}) {
    return <div className={'pane'}>
        {props.header?props.header: (props.title && <header>{props.title}</header>)}
        <div style={{
            border:'0px solid red',
            overflowY:'scroll',
        }}>
        {props.children}
        </div>
    </div>
}
