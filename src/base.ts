import {genId} from "josh_js_util"
import {useEffect, useState} from "react"

export type UUID = string

export type Getter<T> = () => T;
export type ToJSONner<T> = (v: T) => any;
export type PropDef<T> = {
    type: 'string' | 'integer' | 'float' | 'Size' | 'Point',
    editable: boolean,
    default: Getter<T>,
    toJSON: ToJSONner<T>
}
export type Etype = string
export type ObservableListener = (type: Etype) => void
type WrapperCallback<T> = (v:T) => void
type WrapperAnyCallback<T> = (v:T) => void
export type JSONObj = {
    class: string,
    id: UUID,
    props: Record<string, unknown>
}

/*
    use only the correct property names
    use the correct return type for property values
    add listeners for specific properties
    add listener for any change at all
*/

type JSONValue = string | number | object
type JsonOut<Type> = {
    id:string,
    class:string,
    props:Record<keyof Type, JSONValue>,
}
export class PropsBase<Type> {
    private listeners: Map<keyof Type, WrapperCallback<Type[keyof Type]>[]>
    private all_listeners: WrapperAnyCallback<Type>[]
    private values: Map<keyof Type,Type[keyof Type]>
    private defs: Map<keyof Type,PropDef<Type[keyof Type]>>
    private _id: string
    constructor() {
        this._id = genId("Wrapper")
        this.values = new Map()
        this.defs = new Map()
        this.listeners = new Map()
        this.all_listeners = []
    }
    getAllPropDefs() {
        return Array.from(this.defs.entries())
    }
    getPropDef<Key extends keyof Type>(name:Key):PropDef<Type[Key]> {
        return this.defs.get(name) as PropDef<Type[Key]>
    }
    setPropDef<Key extends keyof Type>(name:Key, def:PropDef<Type[Key]>) {
        this.defs.set(name,def)
    }
    getPropValue<K extends keyof Type>(name:K):Type[K] {
        return this.values.get(name) as Type[K]
    }
    setPropValue<K extends keyof Type>(name:K, value:Type[K]) {
        this.values.set(name,value)
        this._get_listeners(name).forEach(cb => cb(value))
    }
    on<K extends keyof Type>(name:K, cb:WrapperCallback<Type[K]>){
        this._get_listeners(name).push(cb)
    }
    onAny(hand: WrapperAnyCallback<Type>) {
        this.all_listeners.push(hand)
    }
    off<K extends keyof Type>(name:K, cb:WrapperCallback<Type[K]>){
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
            class:'Wrapper',
            props:{},
            id:this._id,
        }
        for(const [k,d] of this.getAllPropDefs()) {
            obj.props[k] = d.toJSON(this.getPropValue(k))
        }
        return obj
    }
}
// export function useObservableChange<T>(ob: PropsBase<T>, eventType: string) {
//     const [count, setCount] = useState(0)
//     return useEffect(() => {
//         const hand = () => {
//             setCount(count + 1)
//         }
//         if (ob) ob.addEventListener(eventType, hand)
//         return () => {
//             if (ob) ob.removeEventListener(eventType, hand)
//         }
//
//     }, [ob, count])
// }

