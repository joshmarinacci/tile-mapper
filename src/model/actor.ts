import { Bounds } from "josh_js_util"

import { GameAction, GameActionListDef } from "./action"
import { DefList, PropDefBuilder, PropsBase, PropValues, restoreClassFromJSON, UUID } from "./base"
import { BooleanDef, BoundsDef, NameDef, StringDef } from "./datamodel"

const RefDef = new PropDefBuilder({
  type: "reference",
  default: () => null,
  toJSON: (r, v: UUID | undefined) => v,
  fromJSON: (r, v) => v,
})

type ViewSettingsType = {
  kind: "sprite" | "text" | "none"
  reference: unknown
  bounds: Bounds
  visible: boolean
}
export const ViewSettingsDef: DefList<ViewSettingsType> = {
  kind: StringDef.copy()
    .withDefault(() => "none")
    .withPossibleValues(() => ["sprite", "text", "none"]),
  reference: RefDef.copy().withCustom("image-reference"),
  bounds: BoundsDef,
  visible: BooleanDef.withDefault(() => true),
}
export class ViewSettings extends PropsBase<ViewSettingsType> {
  constructor(opts?: PropValues<ViewSettingsType>) {
    super(ViewSettingsDef, opts)
  }

  setPropValue<K extends keyof ViewSettingsType>(name: K, value: ViewSettingsType[K]) {
    super.setPropValue(name, value)
    if (name === "kind") {
      if (value === "text") {
        this.getPropDef("reference").custom = "font-reference"
      }
      if (value === "sprite") {
        this.getPropDef("reference").custom = "image-reference"
      }
    }
  }
}

type ActorPhysicsSettingsType = {
  gravity: boolean
  tiles: boolean
  actors: boolean
  bounds: Bounds
}
export const ActorPhysicsSettingsDefs: DefList<ActorPhysicsSettingsType> = {
  gravity: BooleanDef.copy().withDefault(() => true),
  tiles: BooleanDef.copy().withDefault(() => true),
  actors: BooleanDef.copy().withDefault(() => true),
  bounds: BoundsDef.copy(),
}
export class ActorPhysicsSettings extends PropsBase<ActorPhysicsSettingsType> {
  constructor(opts?: PropValues<ActorPhysicsSettingsType>) {
    super(ActorPhysicsSettingsDefs, opts)
  }
}

type StateType = Record<string, any>
export type ActorType = {
  name: string
  actions: GameAction[]
  view: ViewSettings
  physics: ActorPhysicsSettings
  state: StateType
}

const StatePropDef = new PropDefBuilder({
  type: "record",
  default: () => ({}),
  fromJSON: (r, v) => v,
  toJSON: (r, v) => v,
  format: (v) => "cannot draw",
})

const ObjPropDef = new PropDefBuilder<ActorPhysicsSettings>({
  type: "object",
  default: () => null,
  toJSON: (r, v) => v.toJSON(r),
  format: (v) => "",
  fromJSON: (r, j) => restoreClassFromJSON(r, j),
}).withCustom("sub-object")

export const ActorDefs: DefList<ActorType> = {
  name: NameDef,
  actions: GameActionListDef,
  view: ObjPropDef.copy()
    .withDefault(() => new ViewSettings())
    .withWatchChildren(true),
  physics: ObjPropDef.copy()
    .withDefault(() => new ActorPhysicsSettings())
    .withWatchChildren(true),
  state: StatePropDef,
}

export class Actor extends PropsBase<ActorType> {
  constructor(opts?: PropValues<ActorType>) {
    super(ActorDefs, opts)
  }
}
