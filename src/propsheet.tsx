import "./propsheet.css"

import {Size} from "josh_js_util"
import React, {useEffect, useState} from "react"

import {PropDef, PropsBase} from "./base"

function PropEditor<T>(props: { target: PropsBase<T>, name:keyof T, def:PropDef<T[keyof T]>}) {
    const {target, def, name} = props
    const [count, setCount] = useState(0)
    const new_val = target.getPropValue(name)
    useEffect(() => {
        const hand = () => setCount(count + 1)
        target.on(name,hand)
        return () => target.off(name, hand)
    })
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
            <label>w</label>
            <input type={'number'}
                          value={val.w}
                          onChange={(e)=>{
                              const v = parseInt(e.target.value)
                              const size = new Size(v,val.h)
                              target.setPropValue(props.name,size as T[keyof T])
                          }}/>
            <label>h</label>
            <input type={'number'}
                          value={val.h}
                          onChange={(e)=>{
                              const v = parseInt(e.target.value)
                              const size = new Size(val.w,v)
                              props.target.setPropValue(props.name,size as T[keyof T])
                          }}/>
        </>
    }
    return <label>no editor for it</label>
}

export function PropSheet<T>(props: { target: PropsBase<T>|null }) {
    if(!props.target) return <div>nothing selected</div>
    return <div className={'prop-sheet pane'}>
        <header>props</header>
        {Array.from(props.target.getAllPropDefs()).map(([name,def]) => {
            return <>
                <label key={`label_${name.toString()}`}>{name.toString()}</label>
                <PropEditor key={`editor_${name.toString()}`}
                            target={props.target}
                            name={name}
                            def={def}/>
            </>
        })}
    </div>
}
