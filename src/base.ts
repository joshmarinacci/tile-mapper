import {genId} from "josh_js_util"
import {useEffect, useState} from "react"

import {GlobalState} from "./state"

export type UUID = string
export type Getter<T> = () => T;
export type JSONValue = string | number | object | boolean | []
export type JsonOut<Type> = {
    id:string,
    class:string,
    props:Record<keyof Type, JSONValue>,
}
export type ToJSONner<T> = (v: T) => JSONValue;
export type FromJSONner<T> = (v: JSONValue) => T
export type ToFormatString<T> = (v: T) => string;
export type PropDef<T> = {
    type: 'string' | 'integer' | 'float' | 'Size' | 'Point' | 'Bounds' | 'boolean' | 'array' | 'object',
    editable: boolean,
    default: Getter<T>,
    toJSON: ToJSONner<T>,
    fromJSON?: FromJSONner<T>
    format: ToFormatString<T>
    expandable?:boolean
    hidden?:boolean,
}
type WrapperCallback<Value> = (v:Value) => void
type WrapperAnyCallback<Type> = (t:Type) => void


export type DefList<Type> = Record<keyof Type, PropDef<Type[keyof Type]>>
export type PropValues<Type> = Partial<Record<keyof Type, Type[keyof Type]>>

export class PropsBase<Type> {
    private listeners: Map<keyof Type, WrapperCallback<Type[keyof Type]>[]>
    private all_listeners: WrapperAnyCallback<Type>[]
    private values: Map<keyof Type,Type[keyof Type]>
    private defs: Map<keyof Type,PropDef<Type[keyof Type]>>
    _id: string
    constructor(defs:DefList<Type>, options?:PropValues<Type>) {
        this._id = genId("Wrapper")
        this.values = new Map()
        this.defs = new Map()
        this.listeners = new Map()
        this.all_listeners = []
        for(const [k,d] of Object.entries(defs)) {
            this.setPropDef(k as keyof Type,d as PropDef<Type[keyof Type]>)
            this.setPropValue(k as keyof Type,this.getPropDef(k as keyof Type).default())
        }
        if(options) this.setProps(options)
    }
    setProps(props: PropValues<Type>) {
        for(const [k,d ] of Object.entries(props)) {
            this.setPropValue(k as keyof Type,d as Type[keyof Type])
        }
    }
    getAllPropDefs() {
        return Array.from(this.defs.entries())
    }
    getAllPropDefsAsMap() {
        return this.defs
    }

    getPropDef<Key extends keyof Type>(name:Key):PropDef<Type[Key]> {
        if(!this.defs.has(name)) throw new Error("")
        return this.defs.get(name) as unknown as PropDef<Type[Key]>
    }
    setPropDef<Key extends keyof Type>(name:Key, def:PropDef<Type[Key]>) {
        this.defs.set(name,def as unknown as PropDef<Type[keyof Type]>)
    }
    getPropValue<K extends keyof Type>(name:K):Type[K] {
        return this.values.get(name) as Type[K]
    }
    setPropValue<K extends keyof Type>(name:K, value:Type[K]) {
        this.values.set(name,value)
        this._fire(name,value)
    }
    _fire<K extends keyof Type>(name:K, value:Type[K]) {
        this._get_listeners(name).forEach(cb => cb(value))
        this._fireAll()
    }
    on<K extends keyof Type>(name:K, cb:WrapperCallback<Type[K]>){
        this._get_listeners(name).push(cb)
    }
    onAny(hand: WrapperAnyCallback<Type>) {
        this.all_listeners.push(hand)
    }
    off<K extends keyof Type>(name:K, cb:WrapperCallback<Type[K]>){
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.listeners.set(name, this._get_listeners(name).filter(c => c !== cb))
    }
    offAny(hand: WrapperAnyCallback<Type>) {
        this.all_listeners = this.all_listeners.filter(cb => cb !== hand)
    }
    private _get_listeners<K extends keyof Type>(name: K) {
        if(!this.listeners.has(name)) {
            this.listeners.set(name,[])
        }
        return this.listeners.get(name) as WrapperCallback<Type[K]>[]
    }
    toJSON() {
        const obj:JsonOut<Type> = {
            class:CLASS_REGISTRY.lookupNameForObject(this),
            props:{} as Record<keyof Type, JSONValue>,
            id:this._id,
        }
        for(const [k,d] of this.getAllPropDefs()) {
            obj.props[k] = d.toJSON(this.getPropValue(k))
        }
        return obj
    }

    _fireAll() {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.all_listeners.forEach(cb => cb(this))
    }
}


export type Shortcut = {
    key:string,
    meta:boolean,
    shift:boolean,
    control:boolean,
    alt:boolean,
}
export interface MenuAction{
    type:string,
    title:string
    shortcut?:Shortcut,
    description?:string
    // icon?:SupportedIcons,
    tags?:string[],
}
export interface SimpleMenuAction extends MenuAction{
    type: 'simple',
    perform: (state:GlobalState) => Promise<void>
}

export class ActionRegistry {
    private actions: MenuAction[]
    private by_key: Map<string, MenuAction[]>

    constructor() {
        this.actions = []
        this.by_key = new Map()
    }

    match(e: React.KeyboardEvent): MenuAction | null {
        if (this.by_key.has(e.key)) {
            let actions = this.by_key.get(e.key)
            if (!actions) return null
            actions = actions.filter(a => a.shortcut?.meta === e.metaKey)
            actions = actions.filter(a => a.shortcut?.shift === e.shiftKey)
            if (actions.length > 0) return actions[0]
        }
        return null
    }

    register(actions: MenuAction[]) {
        actions.forEach(a => {
            this.actions.push(a)
            if (a.shortcut) {
                let acts = this.by_key.get(a.shortcut.key)
                if (!acts) acts = []
                acts.push(a)
                this.by_key.set(a.shortcut.key, acts)
            }
        })
    }

    all():MenuAction[] {
        return this.actions.slice()
    }
}

export type AllPropsWatcher<T> = (v: T) => void

export function useWatchAllProps<O extends PropsBase<any>>(target: O, watcher?: AllPropsWatcher<O>) {
    const [count, setCount] = useState(0)
    useEffect(() => {
        const hand = () => {
            if(watcher) watcher(target)
            setCount(count+1)
        }
        target.onAny(hand)
        return () => target.offAny(hand)
    }, [target,count])
}

export type PropWatcher<T> = (v: T) => void

export function useWatchProp<Type, Key extends keyof Type>(
    target: PropsBase<Type>,
    name:Key,
    watcher?: PropWatcher<Type[keyof Type]>
) {
    const [count, setCount] = useState(0)
    useEffect(() => {
        const hand = () => {
            if(watcher) watcher(target.getPropValue(name))
            setCount(count+1)
        }
        target.on(name,hand)
        return () => target.off(name,hand)
    }, [target,count])
}

class ClassRegistry {
    classByName: Map<string, unknown>
    defsByName: Map<string, DefList<any>>
    private namesByClass: Map<any, string>

    constructor() {
        this.classByName = new Map()
        this.defsByName = new Map()
        this.namesByClass = new Map()
    }

    register<Type>(name:string, clazz: unknown, defs: DefList<Type>) {
        this.log("registering class", clazz)
        this.classByName.set(name, clazz)
        this.defsByName.set(name, defs)
        this.namesByClass.set(clazz,name)
    }

    lookupNameForObject(target:PropsBase<any>) {
        const clazz = target.constructor
        this.log("checking name",clazz)
        if(this.namesByClass.has(clazz)) {
            this.log("found class for target",clazz,this.namesByClass.get(clazz))
            return this.namesByClass.get(clazz)
        }
        throw new Error("cannot serialize class")
    }

    private log(...args:unknown[]) {
        console.log("ClassRegistry",...args)
    }
}

export const CLASS_REGISTRY = new ClassRegistry()

const CLASS_NAME_MAP:Record<string, string> = {
    'Doc2':'Doc',
    'Sheet2':'Sheet',
    '_Tile2':'Tile',
    'Map2':'Map',
    'TileLayer2':'TileLayer',
    'Test2':'GameTest',
}
export function restoreClassFromJSON<Type>(json: JsonOut<Type>): PropsBase<Type> {
    console.log("restoring class", json)
    if(CLASS_NAME_MAP[json.class]) json.class = CLASS_NAME_MAP[json.class]
    const Clazz = CLASS_REGISTRY.classByName.get(json.class)
    if(!Clazz) throw new Error(`class missing for ${json.class}`)
    const defs = CLASS_REGISTRY.defsByName.get(json.class)
    if (!defs) throw new Error(`defs missing for ${json.class}`)
    const args = {}
    for (const key of Object.keys(defs)) {
        const def = defs[key]
        if(json.props.hasOwnProperty(key)) {
            const val = def.fromJSON ? def.fromJSON(json.props[key]) : json.props[key]
            args[key] = val
            console.log("setting",key,'to',val)
        } else {
            console.log(`prop missing in json: ${key}. using default: ${def.default()}`)
            args[key] = def.default()
        }
    }
    const obj = new Clazz(args)
    obj._id = json.id
    console.log("created object is",obj)
    return obj
}

export function appendToList<Type, Key extends keyof Type>(target: PropsBase<Type>, key: Key, value: Type[keyof Type]) {
    const data = (target.getPropValue(key) as unknown[]).slice()
    data.push(value)
    target.setPropValue(key, data as Type[keyof Type])
}
