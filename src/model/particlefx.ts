import { CLASS_REGISTRY, DefList, PropsBase, PropValues } from "./base"
import { NameDef } from "./datamodel"

type ParticleFXType = {
  name: string
}

const ParticleFXType: DefList<ParticleFXType> = {
  name: NameDef,
}

export class ParticleFX extends PropsBase<ParticleFXType> {
  constructor(opts?: PropValues<ParticleFXType>) {
    super(ParticleFXType, opts)
  }
}
CLASS_REGISTRY.register("ParticleFX", ParticleFX, ParticleFXType)
