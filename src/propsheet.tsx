import "./propsheet.css"

import {Size} from "josh_js_util"
import React, {useEffect, useState} from "react"

import {PropDef, PropsBase} from "./base"

/*
 Doc is
    impl: EditableDoc
    name: string
    palette: ImagePalette
    sheets: zero or more of Sheet
    maps: zero or more of Map
    tests: zero or more of Test
    spriteSize: Size

ImagePalette:
    name: string
    colors: zero or more of string

Sheet:
    id: string
    name: string
    sprites: zero or more of Sprite

Sprite:
    name:
    data: zero or more of number
    blocking: boolean
Map:
    name: string
    size: Size
    cells: zero or more of MapCell

MapCell:
    tile_id: sheet_id
Test:
    name: string
    map_id: map_id
    viewport: Size


Size is builtin
Size.editor is <Size Editor/>

Test is:
    name: string, editable, default:new test,
    map_id:  Map.id
    viewport: Size, editable, default: (16,8), editor is <SizeEditor/>

Map is:
    name: string, editable, default: new map
    size: Size, editable, default: (30,15)
    cells: MapCell[], editable=false, default:()=>make_new_cell_array()
MapCell is:
    tile_id: Sprite.id
*/




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

export function PropSheet<T>(props: { target: PropsBase<T> }) {
    return <div className={'prop-sheet'}>
        {Array.from(props.target.getAllPropDefs()).map(([name,def]) => {
            return <>
                <label key={`label_${name.toString()}`}>{name.toString()}</label>
                <PropEditor key={`editor_${name.toString()}`}
                            target={props.target}
                            name={name}
                            def={def}/>
            </>
        })}
        {/*<div key={'toolbar'} className={'toolbar'}>*/}
        {/*    <button onClick={() => console.log(props.target.toJSON())}>save</button>*/}
        {/*</div>*/}
    </div>
}
