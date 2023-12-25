import { DefList, PropDefBuilder, PropsBase, PropValues } from "./base"
import { NameDef, ObjectListDef, StringDef } from "./datamodel"

export type TriggerKind =
  | "game-start"
  | "level-start"
  | "intersect"
  | "jump-action"
  | "primary-action"
  | "frame"
export type GameActionType = {
  name: string
  trigger: TriggerKind
  code: string
}
export const GameActionDefs: DefList<GameActionType> = {
  name: NameDef,
  trigger: StringDef.copy()
    .withDefault(() => "game-start")
    .withPossibleValues(() => {
      return ["game-start", "level-start", "intersect", "jump-action", "primary-action", "frame"]
    }),
  code: StringDef.copy().withDefault(() => "console.log('event happened')"),
}
export class GameAction extends PropsBase<GameActionType> {
  constructor(opts?: PropValues<GameActionType>) {
    super(GameActionDefs, opts)
  }
}

export const GameActionListDef: PropDefBuilder<GameAction[]> = ObjectListDef.copy()
  .withHidden(true)
  .withExpandable(true)
