import { DefList, PropDefBuilder, PropsBase, PropValues } from "./base"
import { NameDef, ObjectListDef, StringDef } from "./datamodel"

export type TriggerKind = "jump" | "intersect" | "press-a"
export type GameActionType = {
  name: string
  trigger: TriggerKind
  code: string
}
export const GameActionDefs: DefList<GameActionType> = {
  name: NameDef,
  trigger: StringDef.copy().withDefault(() => "press-a"),
  code: StringDef.copy().withDefault(() => "some code"),
}
export class GameAction extends PropsBase<GameActionType> {
  constructor(opts?: PropValues<GameActionType>) {
    super(GameActionDefs, opts)
  }
}

export const GameActionListDef: PropDefBuilder<GameAction[]> = ObjectListDef.copy()
  .withHidden(true)
  .withExpandable(true)
