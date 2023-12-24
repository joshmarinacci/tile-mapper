import { DefList, IntegerSettings, PropsBase, PropValues } from "./base"
import { FloatDef, IntegerDef, NameDef, StringDef } from "./datamodel"

type SoundFXType = {
  name: string
  frequency: number
  duration: number
  attack: number
  decay: number
  pitchBend: number
  oscilatorType: "sawtooth" | "sine" | "square" | "triangle"
  peakVolume: number
}

export const SoundFXDefs: DefList<SoundFXType> = {
  name: NameDef,
  frequency: IntegerDef.copy()
    .withDefault(() => 440)
    .withSettings({ type: "integer", stepSize: 10 } as IntegerSettings),
  duration: FloatDef.copy().withDefault(() => 0.5),
  attack: FloatDef.copy().withDefault(() => 0.2),
  decay: FloatDef.copy().withDefault(() => 0.2),
  oscilatorType: StringDef.copy().withDefault(() => "sawtooth"),
  pitchBend: IntegerDef.copy()
    .withDefault(() => 0)
    .withSettings({ type: "integer", stepSize: 1 } as IntegerSettings),
  peakVolume: FloatDef.copy().withDefault(() => 0.5),
}

export class SoundFX extends PropsBase<SoundFXType> {
  constructor(opts?: PropValues<SoundFXType>) {
    super(SoundFXDefs, opts)
  }
}
