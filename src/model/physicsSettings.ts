import {
  DefList,
  PropDef,
  PropDefBuilder,
  PropsBase,
  PropValues,
  restoreClassFromJSON,
} from "./base"
import { FloatDef, NameDef } from "./datamodel"

const JumpDef: PropDef<number> = FloatDef.copy().withDefault(() => -5)
const GravityDef = FloatDef.copy().withDefault(() => 0.2)
const MoveSpeedDef = FloatDef.copy().withDefault(() => 0.5)
const MaxFallSpeedDef = FloatDef.copy().withDefault(() => 0.5)
const FrictionDef = FloatDef.copy().withDefault(() => 0.99)

type PhysicsSettingsType = {
  name: string
  gravity: number
  jump_power: number
  move_speed: number
  move_speed_max: number
  friction: number
}

export const PhysicsSettingsDefs: DefList<PhysicsSettingsType> = {
  name: NameDef,
  gravity: GravityDef,
  jump_power: JumpDef,
  move_speed: MoveSpeedDef,
  move_speed_max: MaxFallSpeedDef,
  friction: FrictionDef,
}

export class PhysicsSettings extends PropsBase<PhysicsSettingsType> {
  constructor(opts?: PropValues<PhysicsSettingsType>) {
    super(PhysicsSettingsDefs, opts)
  }
}

export const PhysicsSettingsPropDef = new PropDefBuilder<PhysicsSettings>({
  type: "object",
  format: () => "physics settings",
  default: () => new PhysicsSettings({ name: "standard" }),
  toJSON: (r, v) => v.toJSON(r),
  fromJSON: (r, v) => restoreClassFromJSON(r, v),
}).withHidden(false)
