import { Size } from "josh_js_util"

import { PICO8 } from "./common/common"
import { DefList, PropDef, PropsBase, PropValues } from "./model/base"
import { BooleanDef } from "./model/datamodel"
import { GameDoc } from "./model/gamedoc"

type GlobalStateType = {
  doc: GameDoc
  mode: string
  selection: PropsBase<unknown>
  localStorage: Storage
  showLeft: boolean
  showRight: boolean
}

const DocDef: PropDef<GameDoc> = {
  type: "string",
  hidden: false,
  expandable: false,
  format: () => "global state",
  toJSON: (o) => {
    return o.toString()
  },
  fromJSON: (v) => v as GameDoc,
  watchChildren: false,
  editable: false,
  default: () => {
    const size = new Size(10, 10)
    return new GameDoc({ tileSize: size, name: "unnamed doc", palette: PICO8 })
  },
}
const ModeDef: PropDef<string> = {
  type: "string",
  default: () => "tiles",
  toJSON: (o) => o,
  editable: false,
  format: (o) => o,
  hidden: true,
  expandable: false,
  watchChildren: false,
  fromJSON: (v) => v as string,
}
const SelectedDef: PropDef<unknown> = {
  type: "object",
  expandable: false,
  hidden: true,
  watchChildren: false,
  fromJSON: (v) => v,
  default: () => undefined,
  toJSON: () => "unknown",
  editable: false,
  format: () => "unknown",
}
const StateDef: DefList<GlobalStateType> = {
  doc: DocDef,
  mode: ModeDef,
  selection: SelectedDef,
  showLeft: BooleanDef.copy().withDefault(() => true),
  showRight: BooleanDef.copy().withDefault(() => true),
  localStorage: {
    type: "object",
    expandable: false,
    hidden: true,
    default: () => null,
    editable: false,
    watchChildren: false,
  },
}

export class GlobalState extends PropsBase<GlobalStateType> {
  localStorage: Storage
  private sp: SelectionPath

  constructor(opts?: PropValues<GlobalStateType>) {
    super(StateDef)
    if (typeof localStorage !== "undefined") {
      this.localStorage = localStorage
    } else {
      this.localStorage = opts?.localStorage as Storage
    }
    this.sp = new SelectionPath()
  }

  clearSelection() {
    this.setPropValue("selection", undefined as unknown as PropsBase<unknown>)
    this.sp = new SelectionPath()
  }

  setSelection<T>(doc: PropsBase<T>) {
    this.setPropValue("selection", doc as unknown as PropsBase<unknown>)
  }

  setSelectionTarget<T>(target: PropsBase<T>) {
    this.sp = new SelectionPath(target, this.getPropValue("doc"))
    this.setSelection(target)
  }

  getSelectionPath(): SelectionPath {
    return this.sp
  }
}

export class SelectionPath {
  path: PropsBase<unknown>[]

  constructor(target?: PropsBase<unknown>, doc?: GameDoc) {
    this.path = []
    if (target instanceof GameDoc) {
      this.path = [target]
    }
    if (doc) {
      this.path = this.find_path_to_target(doc, target)
    }
  }

  isEmpty() {
    return this.path.length <= 1
  }

  start(): PropsBase<unknown> {
    return this.path[0]
  }

  contains<T>(obj: PropsBase<T>) {
    return this.path.includes(obj)
  }

  parent() {
    const parts = this.path.slice(1)
    return new SelectionPath(parts[0], parts[1])
  }

  private find_path_to_target<T>(current: PropsBase<T>, target: PropsBase<T>): PropsBase<T>[] {
    if (current === target) return [current]
    for (const [name, def] of current.getAllPropDefs()) {
      const val = current.getPropValue(name)
      if (val === target) return [val]
      if (def.type === "array") {
        const arr = val as []
        for (let i = 0; i < arr.length; i++) {
          const res = this.find_path_to_target(arr[i], target)
          if (res.length > 0) {
            return [...res, current]
          }
        }
      }
    }
    return []
  }
}
