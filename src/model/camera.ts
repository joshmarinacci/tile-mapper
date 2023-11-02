import { Bounds } from "josh_js_util"

import {
  CLASS_REGISTRY,
  DefList,
  PropDefBuilder,
  PropsBase,
  PropValues,
  restoreClassFromJSON,
} from "./base"
import { BoundsDef, NameDef } from "./datamodel"

type CameraType = {
  name: string
  viewport: Bounds
  focus: Bounds
}

const CameraDefs: DefList<CameraType> = {
  focus: BoundsDef.copy(),
  name: NameDef,
  viewport: BoundsDef.copy(),
}

export class Camera extends PropsBase<CameraType> {
  constructor(opts?: PropValues<CameraType>) {
    super(CameraDefs, opts)
  }
}
CLASS_REGISTRY.register("Camera", Camera, CameraDefs)

export const CameraPropDef = new PropDefBuilder<Camera>({
  type: "object",
  format: () => "camera",
  default: () => new Camera(),
  toJSON: (v) => v.toJSON(),
  fromJSON: (v) => restoreClassFromJSON(v),
}).withHidden(false)
