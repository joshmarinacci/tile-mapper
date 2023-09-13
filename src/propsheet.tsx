import "./propsheet.css"

import {Size} from "josh_js_util"
import React, {useEffect, useState} from "react"

import {PropDef} from "./base"
import {TestImpl} from "./defs"

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

// function SizeEditor(props:{}) {
//
// }

// const TestDef = {
//     name: {
//         type:'string',
//         editable:true,
//         default: () => 'new test',
//     },
//     map_id: {
//         type: 'reference',
//         target: 'Map'
//     },
//     viewport: {
//         type: 'Size',
//         editable: true,
//         default: () => new Size(16,8),
//         editor: () => SizeEditor,
//     },
// }



function PropEditor(props: { target: TestImpl, name:string, def:PropDef}) {
    const [count, setCount] = useState(0)
    const new_val = props.target.getPropValue(props.name)
    useEffect(() => {
        const hand = () => setCount(count + 1)
        props.target.addEventListener('changed',hand)
        return () => props.target.removeEventListener('changed', hand)
    })
    if(props.def.type === 'string') {
        return <input type={'text'}
                      value={new_val+""}
                      onChange={(e)=>{
                          props.target.setPropValue(props.name,e.target.value)
                      }}/>
    }
    if(props.def.type === 'integer') {
        return <input type={'number'}
                      value={Math.floor(new_val as number)}
                      onChange={(e)=>{
                          props.target.setPropValue(props.name,parseInt(e.target.value))
                      }}/>
    }
    if(props.def.type === 'float') {
        return <input type={'number'}
                      value={(new_val as number).toFixed(2)}
                      onChange={(e)=>{
                          props.target.setPropValue(props.name,parseFloat(e.target.value))
                      }}/>
    }
    if(props.def.type === 'Size') {
        const val = new_val as Size
        return <>
            <label>w</label>
            <input type={'number'}
                          value={val.w}
                          onChange={(e)=>{
                              const v = parseInt(e.target.value)
                              const size = new Size(v,val.h)
                              props.target.setPropValue(props.name,size)
                          }}/>
            <label>h</label>
            <input type={'number'}
                          value={val.h}
                          onChange={(e)=>{
                              const v = parseInt(e.target.value)
                              const size = new Size(val.w,v)
                              props.target.setPropValue(props.name,size)
                          }}/>
        </>
    }
    return <label>no editor for it</label>
}

export function PropSheet(props: { target: TestImpl }) {
    console.log("PropSheet",props.target)
    return <div className={'prop-sheet'}>
        {Array.from(props.target.props()).map(([name,def]) => {
            return <>
                <label key={`label_${name}`}>{name}</label>
                <PropEditor key={`editor_${name}`}
                            target={props.target}
                            name={name}
                            def={def}/>
            </>
        })}
        <div key={'toolbar'} className={'toolbar'}>
            <button onClick={() => console.log(props.target.toJSON())}>save</button>
        </div>
    </div>
}
