import { DefList, IntegerSettings, PropsBase, PropValues } from "./base"
import { BooleanDef, FloatDef, IntegerDef, NameDef, StringDef } from "./datamodel"

type ParticleFXType = {
  name: string
  color: string
  rate: number
  size: number
  maxAge: number
  maxParticles: number
  duration: number // msec currently
  angle: number
  angleSpread: number
  velocity: number
  velocitySpread: number
  infinite: boolean
}

export const ParticleFXDefs: DefList<ParticleFXType> = {
  name: NameDef,
  color: StringDef.copy()
    .withDefault(() => "red")
    .withCustom("palette-color"),
  rate: IntegerDef.copy().withDefault(() => 1),
  size: FloatDef.copy().withDefault(() => 3),
  maxAge: IntegerDef.copy()
    .withDefault(() => 40)
    .withSettings({
      type: "integer",
      min: 10,
      max: 1000,
      stepSize: 10,
    } as IntegerSettings),
  maxParticles: IntegerDef.copy()
    .withDefault(() => 100)
    .withSettings({
      type: "integer",
      min: 0,
      max: 1000,
      stepSize: 10,
    } as IntegerSettings),
  duration: FloatDef.copy().withDefault(() => 1),
  angle: IntegerDef.copy()
    .withDefault(() => 180)
    .withSettings({
      type: "integer",
      min: -360,
      max: 360,
      stepSize: 10,
    } as IntegerSettings),
  angleSpread: IntegerDef.copy()
    .withDefault(() => 5)
    .withSettings({
      type: "integer",
      min: 0,
      max: 180,
      stepSize: 10,
    } as IntegerSettings),
  velocity: FloatDef.copy().withDefault(() => 1.0),
  velocitySpread: FloatDef.copy(),
  infinite: BooleanDef.copy().withDefault(() => true),
}

export class ParticleFX extends PropsBase<ParticleFXType> {
  constructor(opts?: PropValues<ParticleFXType>) {
    super(ParticleFXDefs, opts)
  }
}
