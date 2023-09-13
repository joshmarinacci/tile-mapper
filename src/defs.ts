import {ArrayGrid, genId, Point, Size} from "josh_js_util"

import {JSONObj, ObjDef, ObservableBase, PropDef, UUID} from "./base"
import {EditableMapCell} from "./model"

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

export class PropsBase extends ObservableBase {
    _props: Map<string,PropDef<unknown>>
    _values: Map<string, unknown>
    constructor(def:ObjDef) {
        super()
        this._props = new Map<string,PropDef<unknown>>
        Object.keys(def).forEach(key => {
            this._props.set(key, def[key])
        })
        this._values = new Map<string,unknown>
        for(const key of this._props.keys()) {
            this._values.set(key,this._props.get(key)?.default())
        }
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
}
export class TestImpl extends PropsBase {
    private _id: string
    constructor(def:ObjDef) {
        super(def)
        this._id = genId('TestImpl')
    }
    static make():TestImpl {
        return new TestImpl(TestDef)
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
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if('viewport' in json) test._values.set('viewport',Size.fromJSON(json.viewport))
        return test
    }
}

const MapDef:ObjDef = {
    'name':{
        type:'string',
        editable:true,
        default: () => 'new test',
        toJSON: (v:string) => v,
    },
    'size':{
        type:'Size',
        editable:false,
        default: () => new Size(10,10),
        toJSON: (v:Size) => v.toJSON(),
    },
}
export class MapImpl extends PropsBase {
    _id:string
    cells: ArrayGrid<EditableMapCell>
    constructor(def:ObjDef) {
        super(def)
        this._id = genId('MapImpl')
        const size =this.getPropValue('size') as Size
        this.cells = new ArrayGrid<EditableMapCell>(size.w,size.h)
        this.cells.fill(()=>({tile:"nothin"}))
    }
    static make():MapImpl {
        return new MapImpl(MapDef)
    }
    static fromJSON(json:object):MapImpl {
        console.log("MapImpl.fromJSON",json)
        const map = MapImpl.make()
        if('id' in json) map._id = json.id as UUID
        if('name' in json) map.setPropValue('name',json.name)
        const size = new Size(json.width, json.height)
        map.setPropValue('size', size)
        map.cells = new ArrayGrid<EditableMapCell>(size.w,size.h)
        map.cells.set_from_list(json.cells)
        return map
    }
}
