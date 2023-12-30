import { Bounds } from "josh_js_util"

import { GameAction, GameActionListDef } from "./action"
import { DefList, PropDefBuilder, PropsBase, PropValues, restoreClassFromJSON } from "./base"
import { BooleanDef, BoundsDef, NameDef, StringDef } from "./datamodel"

const RefDef = new PropDefBuilder({
  type: "reference",
  default: () => null,
  toJSON: (r, v) => v.toJson(r),
  fromJSON: (r, v) => restoreClassFromJSON(r, v),
})

type ViewSettingsType = {
  kind: "sprite" | "text"
  reference: unknown
  bounds: Bounds
  visible: boolean
}
const ViewSettingsDef: DefList<ViewSettingsType> = {
  kind: StringDef.copy()
    .withDefault(() => "sprite")
    .withPossibleValues(() => ["sprite", "text"]),
  reference: RefDef.copy().withCustom("image-reference"),
  bounds: BoundsDef,
  visible: BooleanDef.withDefault(() => true),
}
class ViewSettings extends PropsBase<ViewSettingsType> {
  constructor(opts?: PropValues<ViewSettingsType>) {
    super(ViewSettingsDef, opts)
  }
}

type ActorPhysicsSettingsType = {
  gravity: boolean
  tiles: boolean
  actors: boolean
  bounds: Bounds
}
const ActorPhysicsSettingsDefs: DefList<ActorPhysicsSettingsType> = {
  gravity: BooleanDef.copy().withDefault(() => true),
  tiles: BooleanDef.copy().withDefault(() => true),
  actors: BooleanDef.copy().withDefault(() => true),
  bounds: BoundsDef.copy(),
}
class ActorPhysicsSettings extends PropsBase<ActorPhysicsSettingsType> {
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
  fromJSON: (r, v) => {},
  toJSON: (r, v) => {},
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
