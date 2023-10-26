import { Size } from "josh_js_util"

import { PICO8 } from "./common/common"
import { DefList, PropDef, PropsBase, PropValues } from "./model/base"
import { BooleanDef, GameDoc } from "./model/datamodel"

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

  constructor(opts?: PropValues<GlobalStateType>) {
    super(StateDef)
    if (typeof localStorage !== "undefined") {
      this.localStorage = localStorage
    } else {
      this.localStorage = opts.localStorage as Storage
    }
  }

  clearSelection() {
    this.setPropValue("selection", undefined)
  }

  setSelection(doc: GameDoc) {
    this.setPropValue("selection", doc)
  }
}
