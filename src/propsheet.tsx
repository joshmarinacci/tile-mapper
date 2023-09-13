import "./propsheet.css"

import {Size} from "josh_js_util"
import React, {useEffect, useState} from "react"

// export type PropDef = {
//     type:'number' | 'point',
// }
// export type Props = Record<string, PropDef>

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

type Getter = () => unknown;

type PropDef = {
    type:'string'|'integer'|'float'|'Size',
    editable: boolean,
    default: Getter,
}

type Etype = string
type ObservableListener = (type: Etype) => void
type JSONObj = {
    class:string,
    props:Record<string, unknown>
}
type ObjDef = Record<string, PropDef>;

export class ObjBase {
    private _listeners: Map<Etype, Array<ObservableListener>>
    constructor() {
        this._listeners = new Map<Etype, Array<ObservableListener>>()
    }
    protected _get_listeners(type: Etype): ObservableListener[] {
        if (!this._listeners.has(type)) this._listeners.set(type, new Array<ObservableListener>())
        return this._listeners.get(type) as ObservableListener[]
    }
    public addEventListener(type: Etype, cb: ObservableListener) {
        this._get_listeners(type).push(cb)
    }
    public removeEventListener(type: Etype, cb: ObservableListener) {
        let list = this._get_listeners(type)
        list = list.filter(l => l !== cb)
        this._listeners.set(type, list)
    }
    protected fire(type: Etype, payload: any) {
        this._get_listeners(type).forEach(cb => cb(payload))
    }
}

const TestDef:ObjDef = {
    'name':{
        type:'string',
        editable:true,
        default: () => 'new test'
    },
    'width': {
        type:'integer',
        editable:true,
        default: () => 0,
    },
    'viewport':{
        type:'Size',
        editable:true,
        default: () => new Size(10,10),
    },
    'jump_power':{
        type:'float',
        editable:true,
        default: () => 0.0,
    }
}

export class TestImpl extends ObjBase {
    _props: Map<string,PropDef>
    private _values: Map<string, unknown>
    constructor(def:ObjDef) {
        super()
        this._props = new Map<string,PropDef>
        Object.keys(def).forEach(key => {
            this._props.set(key, def[key])
        })
        this._values = new Map<string,unknown>
        for(const key of this._props.keys()) {
            this._values.set(key,this._props.get(key)?.default())
        }
    }
    static make():TestImpl {
        return new TestImpl(TestDef)
    }
    props() {
        return this._props.entries()
    }
    getPropValue(name:string) {
        return this._values.get(name)
    }
    setPropValue(name:string, value:unknown) {
        this._values.set(name,value)
        this.fire('changed',{})
    }
    toJSON():JSONObj {
        const json:JSONObj = {
            'class':'TestImpl',
            props:{}
        }
        for(const [k,v] of this._props.entries()) {
            json.props[k] = this._values.get(k)
        }
        return json
    }
}


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
            return <input type={'number'}
                          value={val.w}
                          onChange={(e)=>{
                              const v = parseInt(e.target.value)
                              const size = new Size(v,val.h)
                              props.target.setPropValue(props.name,size)
                          }}/>
            <label>h</label>
            return <input type={'number'}
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
        <div className={'toolbar'}>
            <button onClick={() => console.log(props.target.toJSON())}>save</button>
        </div>
    </div>
}

// function doit() {
//     const map  = MapDef.make()
//     const test = TestDef.make()
//     test.setValue('name','a cool new name')
//     test.setValue('map_id',map.getValue('id'))
//     test.setValue('viewport', new Size(20,20))
//     test.addEventListener('changed',(e) => {
//         // (test.prop === 'name')
//     })
//
//     const propSheet = <PropSheet target={test}/>
// }
