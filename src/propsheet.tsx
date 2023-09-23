import "./propsheet.css"

import {Size} from "josh_js_util"
import React from "react"

import {PropDef, PropsBase, useWatchProp} from "./base"

function PropEditor<T>(props: { target: PropsBase<T>, name:keyof T, def:PropDef<T[keyof T]>}) {
    const {target, def, name} = props
    const new_val = target.getPropValue(name)
    useWatchProp(target,name)
    if(!def.editable) {
        return <span key={`value_${name.toString()}`} className={'value'}><b>{props.def.format(new_val)}</b></span>
    }
    if(def.type === 'string') {
        return <input key={`editor_${name.toString()}`} type={'text'}
                      value={new_val+""}
                      onChange={(e)=>{
                          console.log("setting",name,'to',e.target.value)
                          target.setPropValue(name,e.target.value as T[keyof T])
                      }}/>
    }
    if(def.type === 'integer') {
        return <input  key={`editor_${name.toString()}`}
                       type={'number'}
                      value={Math.floor(new_val as number)}
                      onChange={(e)=>{
                          props.target.setPropValue(props.name,parseInt(e.target.value) as T[keyof T])
                      }}/>
    }
    if(def.type === 'float') {
        return <input  key={`editor_${name.toString()}`}
                       type={'number'}
                      value={(new_val as number).toFixed(2)}
                       step={0.1}
                      onChange={(e)=>{
                          props.target.setPropValue(props.name,parseFloat(e.target.value) as T[keyof T])
                      }}/>
    }
    if(def.type === "boolean") {
        return <input key={`editor_${name.toString()}`} type={'checkbox'}
            checked={new_val as boolean}
                      onChange={e => {
                          props.target.setPropValue(props.name,e.target.checked as T[keyof T])
                      }}
        />
    }
    if(def.type === 'Size') {
        const val = new_val as Size
        return <>
            <label key={`editor_${name.toString()}_w_label`}>w</label>
            <input key={`editor_${name.toString()}_w_input`} type={'number'}
                          value={val.w}
                          onChange={(e)=>{
                              const v = parseInt(e.target.value)
                              const size = new Size(v,val.h)
                              target.setPropValue(props.name,size as T[keyof T])
                          }}/>
            <label key={`editor_${name.toString()}_h_label`}>h</label>
            <input key={`editor_${name.toString()}_h_input`} type={'number'}
                          value={val.h}
                          onChange={(e)=>{
                              const v = parseInt(e.target.value)
                              const size = new Size(val.w,v)
                              props.target.setPropValue(props.name,size as T[keyof T])
                          }}/>
        </>
    }
    return <label key={'nothing'}>no editor for it</label>
}

export function PropSheet<T>(props: { title?:string, target: PropsBase<T>|null }) {
    const {title, target} = props
    const header = <header key={'the-header'}>{title?props.title:'props'}</header>
    if(!target) return <div className={'pane'} key={'nothing'}>{header}nothing selected</div>
    const propnames = Array.from(target.getAllPropDefs())
        .filter(([a,b])=>!b.hidden)
    return <div className={'prop-sheet pane'} key={'prop-sheet'}>
        {header}
        {propnames.map(([name,def]) => {
            return <>
                <label key={`label_${name.toString()}`}>{name.toString()}</label>
                <PropEditor key={`editor_${name.toString()}`}
                            target={target}
                            name={name}
                            def={def}/>
            </>
        })}
    </div>
}
