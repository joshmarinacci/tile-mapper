import { DefList, PropsBase, PropValues } from "./base"
import { BooleanDef, FloatDef, IntegerDef, NameDef, StringDef } from "./datamodel"

type ParticleFXType = {
  name: string
  color: string
  rate: number
  size: number
  maxAge: number
  maxParticles: number
  duration: number
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
  maxAge: IntegerDef.copy().withDefault(() => 40),
  maxParticles: IntegerDef.copy().withDefault(() => 100),
  duration: IntegerDef.copy().withDefault(() => 2000),
  angle: IntegerDef.copy().withDefault(() => 180),
  angleSpread: IntegerDef.copy().withDefault(() => 5),
  velocity: FloatDef.copy().withDefault(() => 1.0),
  velocitySpread: FloatDef.copy(),
  infinite: BooleanDef.copy().withDefault(() => true),
}

export class ParticleFX extends PropsBase<ParticleFXType> {
  constructor(opts?: PropValues<ParticleFXType>) {
    super(ParticleFXDefs, opts)
  }
}
