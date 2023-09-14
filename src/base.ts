import {genId} from "josh_js_util"

export type UUID = string
export type Getter<T> = () => T;
type JSONValue = string | number | object
type JsonOut<Type> = {
    id:string,
    class:string,
    props:Record<keyof Type, JSONValue>,
}
export type ToJSONner<T> = (v: T) => JSONValue;
export type PropDef<T> = {
    type: 'string' | 'integer' | 'float' | 'Size' | 'Point',
    editable: boolean,
    default: Getter<T>,
    toJSON: ToJSONner<T>
}
type WrapperCallback<Value> = (v:Value) => void
type WrapperAnyCallback<Type> = (t:Type) => void
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

export class PropsBase<Type> {
    private listeners: Map<keyof Type, WrapperCallback<Type[keyof Type]>[]>
    private all_listeners: WrapperAnyCallback<Type>[]
    private values: Map<keyof Type,Type[keyof Type]>
    private defs: Map<keyof Type,PropDef<Type[keyof Type]>>
    protected _id: string
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
