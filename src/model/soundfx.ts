import { CLASS_REGISTRY, DefList, PropsBase, PropValues } from "./base"
import { BoundsDef, NameDef } from "./datamodel"

type SoundFXType = {
  name: string
}

const SoundFXDefs: DefList<SoundFXType> = {
  name: NameDef,
}

export class SoundFX extends PropsBase<SoundFXType> {
  constructor(opts?: PropValues<SoundFXType>) {
    super(SoundFXDefs, opts)
  }
}
CLASS_REGISTRY.register("SoundFX", SoundFX, SoundFXDefs)
