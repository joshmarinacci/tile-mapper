import { Bounds } from "josh_js_util"

import { GameAction, GameActionListDef } from "./action"
import { DefList, PropsBase, PropValues } from "./base"
import { BoundsDef, NameDef, StringDef } from "./datamodel"

export type ActorKind = "player" | "enemy" | "item" | "other" | "text"
export type ActorType = {
  name: string
  hitbox: Bounds
  viewbox: Bounds
  sprite: string | undefined
  kind: ActorKind
  actions: GameAction[]
}
export const ActorDefs: DefList<ActorType> = {
  name: NameDef,
  hitbox: BoundsDef,
  viewbox: BoundsDef,
  sprite: {
    type: "reference",
    custom: "image-reference",
    editable: true,
    hidden: false,
    expandable: false,
    default: () => undefined,
    format: (v) => (v ? `uuid ${v}` : "unknown"),
    toJSON: (r, v: string) => v,
    fromJSON: (r, v: string) => v,
  },
  actions: GameActionListDef,
  kind: StringDef.copy()
    .withDefault(() => "item")
    .withCustom("actor-type"),
}

export class Actor extends PropsBase<ActorType> {
  constructor(opts?: PropValues<ActorType>) {
    super(ActorDefs, opts)
  }
}
