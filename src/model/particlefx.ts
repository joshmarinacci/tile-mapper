import { Bounds, Point } from "josh_js_util"

import { RefDef } from "./actor"
import { DefList, FloatSettings, IntegerSettings, PropsBase, PropValues } from "./base"
import { BooleanDef, FloatDef, IntegerDef, NameDef, PointDef, StringDef } from "./datamodel"

type ParticleFXType = {
  name: string

  source: Point | Bounds
  angle: number
  angleSpread: number

  duration: number // seconds
  infinite: boolean

  image: string
  color: string
  size: number

  maxAge: number
  fadeAge: number

  initParticles: number
  maxParticles: number

  rate: number
  velocity: number
  velocitySpread: number
}

export const ParticleFXDefs: DefList<ParticleFXType> = {
  name: NameDef,
  source: PointDef.copy().withDefault(() => new Point(100, 100)),

  angle: IntegerDef.copy()
    .withDefault(() => 45)
    .withSettings({
      type: "integer",
      min: -360,
      max: 360,
      stepSize: 5,
    } as IntegerSettings),
  angleSpread: IntegerDef.copy()
    .withDefault(() => 30)
    .withSettings({
      type: "integer",
      min: 0,
      max: 180,
      stepSize: 10,
    } as IntegerSettings),

  duration: FloatDef.copy()
    .withDefault(() => 3)
    .withFloatSettings({
      type: "float",
      min: 0,
      max: 10,
      stepSize: 0.1,
    }),
  infinite: BooleanDef.copy().withDefault(() => true),

  image: RefDef.copy().withCustom("image-reference"),
  color: StringDef.copy()
    .withDefault(() => "red")
    .withCustom("palette-color"),
  size: IntegerDef.copy()
    .withDefault(() => 1)
    .withIntegerSettings({ type: "integer", stepSize: 1, min: 1, max: 32 }),

  rate: FloatDef.copy()
    .withDefault(() => 0.01)
    .withFloatSettings({ type: "float", min: 0.01, max: 3.0, stepSize: 0.01 }),

  maxAge: FloatDef.copy()
    .withDefault(() => 5)
    .withSettings({
      type: "float",
      min: 0.1,
      max: 10,
      stepSize: 0.1,
    } as FloatSettings),
  fadeAge: FloatDef.copy()
    .withDefault(() => 4)
    .withFloatSettings({
      type: "float",
      min: 0.1,
      max: 10,
      stepSize: 0.1,
    }),
  initParticles: IntegerDef.copy()
    .withDefault(() => 10)
    .withIntegerSettings({
      type: "integer",
      min: 0,
      max: 1000,
      stepSize: 10,
    }),
  maxParticles: IntegerDef.copy()
    .withDefault(() => 100)
    .withIntegerSettings({
      type: "integer",
      min: 0,
      max: 1000,
      stepSize: 10,
    }),

  velocity: FloatDef.copy().withDefault(() => 20.0),
  velocitySpread: FloatDef.copy(),
}

export class ParticleFX extends PropsBase<ParticleFXType> {
  constructor(opts?: PropValues<ParticleFXType>) {
    super(ParticleFXDefs, opts)
  }
}
