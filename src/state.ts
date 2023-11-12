import { Size } from "josh_js_util"

import { PICO8 } from "./common/common"
import { Actor } from "./model/actor"
import { DefList, PropDef, PropsBase, PropValues } from "./model/base"
import { Camera } from "./model/camera"
import { BooleanDef } from "./model/datamodel"
import { GameDoc } from "./model/gamedoc"
import { ActorLayer, GameMap, TileLayer } from "./model/gamemap"
import { ImageObjectLayer, ImagePixelLayer, SImage } from "./model/image"
import { ParticleFX } from "./model/particlefx"
import { PhysicsSettings } from "./model/physicsSettings"
import { PixelFont, PixelGlyph } from "./model/pixelfont"
import { Sheet } from "./model/sheet"
import { SoundFX } from "./model/soundfx"
import { Tile } from "./model/tile"

type GlobalStateType = {
  doc: GameDoc
  mode: string
  selection: PropsBase<unknown>
  localStorage: Storage
  showLeft: boolean
  showRight: boolean
}

const DocDef: PropDef<GameDoc> = {
  type: "string",
  hidden: false,
  expandable: false,
  format: () => "global state",
  toJSON: (o) => {
    return o.toString()
  },
  fromJSON: (v) => v as GameDoc,
  watchChildren: false,
  editable: false,
  default: () => {
    const size = new Size(10, 10)
    return new GameDoc({ tileSize: size, name: "unnamed doc", palette: PICO8 })
  },
}
const ModeDef: PropDef<string> = {
  type: "string",
  default: () => "tiles",
  toJSON: (o) => o,
  editable: false,
  format: (o) => o,
  hidden: true,
  expandable: false,
  watchChildren: false,
  fromJSON: (v) => v as string,
}
const SelectedDef: PropDef<unknown> = {
  type: "object",
  expandable: false,
  hidden: true,
  watchChildren: false,
  fromJSON: (v) => v,
  default: () => undefined,
  toJSON: () => "unknown",
  editable: false,
  format: () => "unknown",
}
const StateDef: DefList<GlobalStateType> = {
  doc: DocDef,
  mode: ModeDef,
  selection: SelectedDef,
  showLeft: BooleanDef.copy().withDefault(() => true),
  showRight: BooleanDef.copy().withDefault(() => true),
  localStorage: {
    type: "object",
    expandable: false,
    hidden: true,
    default: () => null,
    editable: false,
    watchChildren: false,
  },
}

export class GlobalState extends PropsBase<GlobalStateType> {
  localStorage: Storage
  private sp: SelectionPath

  constructor(opts?: PropValues<GlobalStateType>) {
    super(StateDef)
    if (typeof localStorage !== "undefined") {
      this.localStorage = localStorage
    } else {
      this.localStorage = opts?.localStorage as Storage
    }
    this.sp = new SelectionPath()
  }

  clearSelection() {
    this.setPropValue("selection", undefined as unknown as PropsBase<unknown>)
    this.sp = new SelectionPath()
  }

  setSelection<T>(doc: PropsBase<T>) {
    this.setPropValue("selection", doc as unknown as PropsBase<unknown>)
  }

  setSelectionTarget<T>(target: PropsBase<T>) {
    this.sp = new SelectionPath(target, this.getPropValue("doc"))
    this.setSelection(target)
  }

  getSelectionPath(): SelectionPath {
    return this.sp
  }
}

export class SelectionPath {
  path: PropsBase<unknown>[]

  constructor(target?: PropsBase<unknown>, doc?: GameDoc) {
    this.path = []
    if (target instanceof GameDoc) {
      this.path = [target]
    }
    if (doc) {
      if (target instanceof PhysicsSettings) {
        this.path = [target, doc]
      }
      if (target instanceof Camera) {
        this.path = [target, doc]
      }
      if (target instanceof Sheet) {
        this.path = [target, doc]
      }
      if (target instanceof GameMap) {
        this.path = [target, doc]
      }
      if (target instanceof Actor) {
        this.path = [target, doc]
      }
      if (target instanceof SImage) {
        this.path = [target, doc]
      }
      if (target instanceof PixelFont) {
        this.path = [target, doc]
      }
      if (target instanceof ParticleFX) {
        this.path = [target, doc]
      }
      if (target instanceof SoundFX) {
        this.path = [target, doc]
      }
      if (target instanceof Tile) {
        this.path = [target]
        doc.getPropValue("sheets").forEach((sht) => {
          if (sht.getPropValue("tiles").find((tile) => tile === target)) {
            this.path.push(sht)
          }
        })
        this.path.push(doc)
      }
      if (target instanceof TileLayer || target instanceof ActorLayer) {
        this.path = [target]
        doc.getPropValue("maps").forEach((map) => {
          if (map.getPropValue("layers").find((layer) => layer === target)) {
            this.path.push(map)
          }
        })
        this.path.push(doc)
      }
      if (target instanceof ImagePixelLayer || target instanceof ImageObjectLayer) {
        this.path = [target]
        doc.getPropValue("canvases").forEach((map) => {
          if (map.getPropValue("layers").find((layer) => layer === target)) {
            this.path.push(map)
          }
        })
        this.path.push(doc)
      }
      if (target instanceof PixelGlyph) {
        this.path = [target]
        doc.getPropValue("fonts").forEach((font) => {
          if (font.getPropValue("glyphs").find((glyph) => glyph === target)) {
            this.path.push(font)
          }
        })
        this.path.push(doc)
      }
    }
    console.log("path is", this.path)
  }

  isEmpty() {
    return this.path.length <= 1
  }

  start(): PropsBase<unknown> {
    return this.path[0]
  }

  contains<T>(obj: PropsBase<T>) {
    return this.path.includes(obj)
  }

  parent() {
    console.log("getting parent for", this.path.slice(1))
    const parts = this.path.slice(1)
    return new SelectionPath(parts[0], parts[1])
  }
}
