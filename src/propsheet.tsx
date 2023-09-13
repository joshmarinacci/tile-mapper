import "./propsheet.css"

import {genId, Point, Size} from "josh_js_util"
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

export type Getter<T> = () => T;
export type ToJSONner<T> = (v:T) => object;

export type PropDef<T> = {
    type:'string'|'integer'|'float'|'Size'|'Point',
    editable: boolean,
    default: Getter<T>,
    toJSON: ToJSONner<T>
}

export type UUID = string
export type Etype = string
export type ObservableListener = (type: Etype) => void
export type JSONObj = {
    class:string,
    id:UUID,
    props:Record<string, unknown>
}
export type ObjDef = Record<string, PropDef>;

export class ObservableBase {
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
    protected fire(type: Etype, payload: unknown) {
        this._get_listeners(type).forEach(cb => cb(payload))
    }
}

export function useObservableChange(ob: ObservableBase | undefined, eventType: string) {
    const [count, setCount] = useState(0)
    return useEffect(() => {
        const hand = () => {
            setCount(count + 1)
        }
        if (ob) ob.addEventListener(eventType, hand)
        return () => {
            if (ob) ob.removeEventListener(eventType, hand)
        }

    }, [ob, count])
}

const TestDef:ObjDef = {
    'name':{
        type:'string',
        editable:true,
        default: () => 'new test',
        toJSON: (v:string) => v,
    },
    'viewport':{
        type:'Size',
        editable:true,
        default: () => new Size(10,10),
        toJSON: (v:Size) => v.toJSON(),
    },
    'jump_power':{
        type:'float',
        editable:true,
        default: () => 0.0,
        toJSON: (v:number) => v,
    },
    'gravity':{
        type:'Point',
        editable:true,
        default: () => new Point(0,0.1),
        toJSON: (v:Point) => v.toJSON(),
    },
    'move_speed':{
        type:'float',
        editable:true,
        default: () => 0.5,
        toJSON: (v:number) => v,
    },
    'max_fall_speed':{
        type:'float',
        editable:true,
        default: () => 0.5,
        toJSON: (v:number) => v,
    },
    'friction':{
        type:'float',
        editable:true,
        default: () => 0.99,
        toJSON: (v:number) => v,
    },
}

export class TestImpl extends ObservableBase {
    _props: Map<string,PropDef<unknown>>
    private _values: Map<string, unknown>
    private _id: string
    constructor(def:ObjDef) {
        super()
        this._id = genId('TestImpl'),
        this._props = new Map<string,PropDef<unknown>>
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
            id: this._id,
            props:{}
        }
        for(const [k,v] of this._props.entries()) {
            json.props[k] = v.toJSON(this._values.get(k))
        }
        return json
    }
    static fromJSON(json:object):TestImpl {
        console.log("loading from json",json)
        if(!json) throw new Error("null json obj")
        const test = TestImpl.make()
        if('id' in json) test._id = json.id as UUID
        if('name' in json) test._values.set('name',json.name)
        if('viewport' in json) test._values.set('viewport',Size.fromJSON(json.viewport))
        return test
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
