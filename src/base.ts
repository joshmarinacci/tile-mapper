import {useEffect, useState} from "react"

export type Getter<T> = () => T;
export type ToJSONner<T> = (v: T) => object;
export type PropDef<T> = {
    type: 'string' | 'integer' | 'float' | 'Size' | 'Point',
    editable: boolean,
    default: Getter<T>,
    toJSON: ToJSONner<T>
}
export type UUID = string
export type Etype = string
export type ObservableListener = (type: Etype) => void
export type JSONObj = {
    class: string,
    id: UUID,
    props: Record<string, unknown>
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
        this._get_listeners(type).forEach(cb => cb(type))
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
