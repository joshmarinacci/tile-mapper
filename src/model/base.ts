import { genId } from "josh_js_util"
import { useEffect, useState } from "react"

export type UUID = string
export type Getter<T> = () => T
export type GetPossibleValues<T> = () => T[]
export type JSONValue = string | number | object | boolean | object[]
export type JsonOut<Type> = {
  id: string
  class: string
  props: Record<keyof Type, JSONValue>
}
export type ToJSONner<T> = (reg: ClassRegistry, v: T) => JSONValue
export type FromJSONner<T> = (reg: ClassRegistry, v: JSONValue) => T
export type ToFormatString<T> = (v: T) => string
type PropDefBaseTypes =
  | "string"
  | "integer"
  | "float"
  | "Size"
  | "Point"
  | "Bounds"
  | "boolean"
  | "array"
  | "object"
  | "reference"
  | "record"

type PropDefCustomType =
  | "tile-reference"
  | "image-reference"
  | "map-reference"
  | "actor-reference"
  | "font-reference"
  | "actor-type"
  | "palette-color"
  | "sub-object"

export type Settings = {
  type: "integer" | "float"
}
export type FloatSettings = {
  type: "float"
  min: number
  max: number
  stepSize: number
} & Settings
export type IntegerSettings = {
  type: "integer"
  min: number
  max: number
  stepSize: number
} & Settings

export type PropDef<T> = {
  type: PropDefBaseTypes
  custom?: PropDefCustomType
  default: Getter<T>
  toJSON: ToJSONner<T>
  fromJSON: FromJSONner<T>
  format: ToFormatString<T>
  editable: boolean
  expandable: boolean
  hidden: boolean
  watchChildren: boolean
  skipPersisting?: boolean
  settings?: Settings
  possibleValues?: GetPossibleValues<T>
}
type WrapperCallback<Value> = (v: Value) => void
type WrapperAnyCallback<Type> = (t: PropsBase<Type>) => void

export type DefList<Type> = Record<keyof Type, PropDef<Type[keyof Type]>>
export type PropValues<Type> = Partial<Record<keyof Type, Type[keyof Type]>>
// export type ExcludeNonArrayValue<T> = {[K in keyof T as T[K] extends Array<infer Item> ? K : never]: T[K] }
// export type ExcludeNonArrayValue<T> = {[K in keyof T as T[K] extends readonly unknown[] ? K : never]: T[K] }
// export type ArrayElement<ArrayType extends readonly unknown[]> =
//     ArrayType extends readonly (infer ElementType)[] ? ElementType : never;
// type ArrayElementType<ArrayType extends Array> = ArrayType[number];
type Flatten<Type> = Type extends Array<infer Item> ? Item : never

function isPropBase(val: unknown) {
  if (!val) return false
  if (val instanceof PropsBase) return true
  return false
}

export class PropsBase<Type> {
  _id: UUID
  private listeners: Map<keyof Type, WrapperCallback<Type[keyof Type]>[]>
  private all_listeners: WrapperAnyCallback<Type>[]
  private values: Map<keyof Type, Type[keyof Type]>
  private defs: Map<keyof Type, PropDef<Type[keyof Type]>>
  private child_watcher: WrapperAnyCallback<unknown>

  constructor(defs: DefList<Type>, options?: PropValues<Type>) {
    this._id = genId("Wrapper")
    this.values = new Map()
    this.defs = new Map()
    this.listeners = new Map()
    this.all_listeners = []
    this.child_watcher = () => {
      this._fireAll()
    }
    for (const [k, d] of Object.entries(defs)) {
      this.setPropDef(k as keyof Type, d as PropDef<Type[keyof Type]>)
      this.setPropValue(k as keyof Type, this.getPropDef(k as keyof Type).default())
    }
    if (options) this.setProps(options)
  }

  getUUID(): UUID {
    return this._id
  }

  setProps(props: PropValues<Type>) {
    for (const [k, d] of Object.entries(props)) {
      if (!this.defs.has(k)) {
        console.warn(`object does not have property ${k}`)
        continue
      }
      this.setPropValue(k as keyof Type, d as Type[keyof Type])
    }
  }

  getAllPropDefs() {
    return Array.from(this.defs.entries())
  }

  getAllPropDefsAsMap() {
    return this.defs
  }

  getPropDef<Key extends keyof Type>(name: Key): PropDef<Type[Key]> {
    if (!this.defs.has(name)) throw new Error(`object does not have key ${String(name)}`)
    return this.defs.get(name) as unknown as PropDef<Type[Key]>
  }

  setPropDef<Key extends keyof Type>(name: Key, def: PropDef<Type[Key]>) {
    this.defs.set(name, def as unknown as PropDef<Type[keyof Type]>)
  }

  getPropValue<K extends keyof Type>(name: K): Type[K] {
    return this.values.get(name) as Type[K]
  }

  setPropValue<K extends keyof Type>(name: K, value: Type[K]) {
    const def = this.getPropDef(name)
    {
      const val = this.values.get(name)
      if (def.watchChildren && val && Array.isArray(val)) {
        const arr = val as []
        arr.forEach((v: PropsBase<unknown>) => {
          v.offAny(this.child_watcher)
        })
      }
      if (def.watchChildren && isPropBase(val)) val.offAny(this.child_watcher)
    }
    this.values.set(name, value)
    {
      const val = this.values.get(name)
      if (def.watchChildren && val && Array.isArray(val)) {
        val.forEach((v: PropsBase<unknown>) => {
          v.onAny(this.child_watcher)
        })
      }
      if (def.watchChildren && isPropBase(val)) val.onAny(this.child_watcher)
    }
    this._fire(name, value)
  }

  _fire<K extends keyof Type>(name: K, value: Type[K]) {
    this._get_listeners(name).forEach((cb) => {
      cb(value)
    })
    this._fireAll()
  }

  on<K extends keyof Type>(name: K, cb: WrapperCallback<Type[K]>) {
    this._get_listeners(name).push(cb)
  }

  onAny(hand: WrapperAnyCallback<Type>) {
    if (!hand) throw new Error("cannot pass null callback to onAny")
    this.all_listeners.push(hand)
  }

  off<K extends keyof Type>(name: K, cb: WrapperCallback<Type[K]>) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.listeners.set(
      name,
      this._get_listeners(name).filter((c) => c !== cb),
    )
  }

  offAny(hand: WrapperAnyCallback<Type>) {
    this.all_listeners = this.all_listeners.filter((cb) => cb !== hand)
  }

  toJSON(reg: ClassRegistry) {
    const clazz = reg.lookupNameForObject(this)
    if (!clazz) throw new Error("class not found")
    const obj: JsonOut<Type> = {
      class: clazz,
      props: {} as Record<keyof Type, JSONValue>,
      id: this._id,
    }
    for (const [key, def] of this.getAllPropDefs()) {
      if (def.skipPersisting) continue
      if (!def.toJSON)
        throw new Error(`prop def for ${key} in class ${clazz} is missing toJSON function`)
      obj.props[key] = def.toJSON(reg, this.getPropValue(key))
    }
    return obj
  }
  fromJSON(reg: ClassRegistry, json: JsonOut<Type>) {
    // console.log(`object ${this.constructor.name} skipping json customization`)
  }

  _fireAll() {
    this.all_listeners.forEach((cb) => cb(this))
  }

  private _get_listeners<K extends keyof Type>(name: K) {
    if (!this.listeners.has(name)) {
      this.listeners.set(name, [])
    }
    return this.listeners.get(name) as WrapperCallback<Type[K]>[]
  }
}

type PropDefOptions<T> = {
  type: PropDefBaseTypes
  default: Getter<T>
  toJSON: ToJSONner<T>
  fromJSON: FromJSONner<T>
  format: ToFormatString<T>
  custom?: PropDefCustomType
}

export class PropDefBuilder<T> implements PropDef<T> {
  type: PropDefBaseTypes
  editable: boolean
  custom?: PropDefCustomType
  expandable: boolean
  hidden: boolean
  watchChildren: boolean
  skipPersisting: boolean
  default: Getter<T>
  toJSON: ToJSONner<T>
  fromJSON: FromJSONner<T>
  format: ToFormatString<T>
  possibleValues?: GetPossibleValues<T>
  private settings?: Settings
  constructor(options: PropDefOptions<T>) {
    this.type = options.type
    this.editable = true
    this.expandable = false
    this.hidden = false
    this.watchChildren = false
    this.skipPersisting = false
    this.default = options.default
    this.toJSON = options.toJSON
    this.fromJSON = options.fromJSON
    this.format = options.format
    this.custom = options.custom
  }
  copy() {
    return new PropDefBuilder<T>(this)
  }
  withSkipPersisting(skipPersisting: boolean) {
    this.skipPersisting = skipPersisting
    return this
  }
  withHidden(hidden: boolean) {
    this.hidden = hidden
    return this
  }
  withDefault(getter: Getter<T>) {
    this.default = getter
    return this
  }
  withFormat(format: ToFormatString<T>) {
    this.format = format
    return this
  }

  withEditable(editable: boolean) {
    this.editable = editable
    return this
  }

  withCustom(customType: PropDefCustomType) {
    this.custom = customType
    return this
  }

  withWatchChildren(watchesChildren: boolean) {
    this.watchChildren = watchesChildren
    return this
  }

  withExpandable(isExpandable: boolean) {
    this.expandable = isExpandable
    return this
  }

  withIntegerSettings(settings: IntegerSettings) {
    this.settings = settings
    return this
  }
  withFloatSettings(settings: FloatSettings) {
    this.settings = settings
    return this
  }
  withSettings(settings: Settings) {
    this.settings = settings
    return this
  }

  withPossibleValues(getter: GetPossibleValues<T>) {
    this.possibleValues = getter
    return this
  }
}

export type AllPropsWatcher<T> = (v: T) => void

export function useWatchAllProps<Type>(
  target: PropsBase<Type>,
  watcher?: AllPropsWatcher<PropsBase<Type>>,
) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    const hand = () => {
      if (watcher) watcher(target)
      setCount(count + 1)
    }
    target.onAny(hand)
    return () => target.offAny(hand)
  }, [target, count])
}

export type PropWatcher<T> = (v: T) => void

export function useWatchProp<Type, Key extends keyof Type>(
  target: PropsBase<Type>,
  name: Key,
  watcher?: PropWatcher<Type[keyof Type]>,
) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    const hand = () => {
      if (watcher) watcher(target.getPropValue(name))
      setCount(count + 1)
    }
    target.on(name, hand)
    return () => target.off(name, hand)
  }, [target, count])
}

const CLASS_NAME_MAP: Record<string, string> = {
  Doc2: "Doc",
  Sheet2: "Sheet",
  _Tile2: "Tile",
  Map2: "Map",
  TileLayer2: "TileLayer",
  Test2: "GameTest",
}

let GlobalClassRegistry: ClassRegistry | undefined
export function setGlobalClassRegistry(reg: ClassRegistry) {
  GlobalClassRegistry = reg
}
export function getGlobalClassRegistry(): ClassRegistry {
  if (!GlobalClassRegistry) throw new Error("global class registry not defined")
  return GlobalClassRegistry
}

export function restoreClassFromJSON<Type>(
  reg: ClassRegistry,
  json: JsonOut<Type>,
): PropsBase<Type> {
  if (!json) return null
  if (CLASS_NAME_MAP[json.class]) json.class = CLASS_NAME_MAP[json.class]
  const Clazz = reg.classByName.get(json.class)
  if (!json.class) {
    console.log("json is", json)
    throw new Error(`cannot load json without a class: ${JSON.stringify(json)}`)
  }
  if (!Clazz) throw new Error(`class missing for ${json.class}`)
  const defs = reg.defsByName.get(json.class)
  if (!defs) throw new Error(`defs missing for ${json.class}`)
  const args = {}
  for (const key of Object.keys(defs)) {
    const def = defs[key]
    if (json.props.hasOwnProperty(key)) {
      // console.log("prop",key,"def",def)
      const val = def.fromJSON ? def.fromJSON(reg, json.props[key]) : json.props[key]
      args[key] = val
      // console.log("setting",key,'to',val)
    } else {
      // console.log(`prop missing in json: ${key}. using default: ${def.default()}`)
      args[key] = def.default()
    }
  }
  const obj = new Clazz(args)
  obj._id = json.id
  obj.fromJSON(reg, json)
  // console.log("created object is",obj)
  return obj
}

export function appendToList<Type, Key extends keyof Type, Value extends Type[Key]>(
  target: PropsBase<Type>,
  key: Key,
  value: Flatten<Value>,
) {
  const data = (target.getPropValue(key) as unknown[]).slice()
  data.push(value)
  target.setPropValue(key, data as Value)
}

export function removeFromList<Type, Key extends keyof Type, Value extends Type[Key]>(
  target: PropsBase<Type>,
  key: Key,
  value: Flatten<Value>,
) {
  const data = (target.getPropValue(key) as unknown[]).slice()
  const n = data.indexOf(value)
  if (n >= 0) {
    data.splice(n, 1)
  }
  target.setPropValue(key, data as Value)
}

export class ClassRegistry {
  classByName: Map<string, unknown>
  defsByName: Map<string, DefList<unknown>>
  private namesByClass: Map<unknown, string>

  constructor() {
    this.classByName = new Map()
    this.defsByName = new Map()
    this.namesByClass = new Map()
  }

  register<Type>(name: string, clazz: unknown, defs: DefList<Type>) {
    this.log("registering class", name)
    this.classByName.set(name, clazz)
    this.defsByName.set(name, defs)
    this.namesByClass.set(clazz, name)
  }

  lookupNameForObject<Type>(target: PropsBase<Type>) {
    const clazz = target.constructor
    this.log("checking name", clazz)
    if (this.namesByClass.has(clazz)) {
      this.log("found class for target", clazz, this.namesByClass.get(clazz))
      return this.namesByClass.get(clazz)
    }
    throw new Error(`cannot serialize class: ${clazz.name}`)
  }

  private log(...args: unknown[]) {
    // console.log("ClassRegistry", ...args)
  }
}
