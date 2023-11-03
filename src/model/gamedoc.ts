import { Size } from "josh_js_util"

import { drawEditableSprite, ImagePalette } from "../common/common"
import { make_doc_from_json } from "../io/json"
import StdFont from "../resources/std_font.json"
import {
  CLASS_REGISTRY,
  DefList,
  PropDef,
  PropDefBuilder,
  PropsBase,
  PropValues,
  restoreClassFromJSON,
} from "./base"
import { Camera, CameraPropDef } from "./camera"
import {
  Actor,
  GameMap,
  GameTest,
  NameDef,
  ObjectListDef,
  PaletteDef,
  PixelFont,
  Sheet,
  SImage,
  SizeDef,
  Tile,
} from "./datamodel"

export type DocType = {
  name: string
  sheets: Sheet[]
  maps: GameMap[]
  actors: Actor[]
  tests: GameTest[]
  canvases: SImage[]
  fonts: PixelFont[]
  palette: ImagePalette
  tileSize: Size
  assets: PropsBase<unknown>[]
  camera: Camera
}
const PixelFontListDef: PropDefBuilder<PixelFont[]> = ObjectListDef.copy()
  .withHidden(true)
  .withExpandable(true)

const TestsListDef: PropDef<GameTest[]> = {
  type: "array",
  editable: false,
  hidden: true,
  watchChildren: false,
  default: () => [],
  format: (v) => "tests list",
  toJSON: (v) => v.map((n) => n.toJSON()),
  fromJSON: (v) => v.map((a) => restoreClassFromJSON(a)),
  expandable: true,
}
const SheetsListDef: PropDef<Sheet[]> = {
  type: "array",
  editable: false,
  hidden: true,
  watchChildren: false,
  default: () => [],
  toJSON: (v) => v.map((sheet) => sheet.toJSON()),
  format: (v) => "sheets list",
  fromJSON: (v) => v.map((sheet) => restoreClassFromJSON(sheet)),
  expandable: true,
}
const ActorsListDef: PropDef<Actor[]> = {
  type: "array",
  editable: false,
  watchChildren: false,
  default: () => [],
  toJSON: (v) => v.map((actor) => actor.toJSON()),
  format: (v) => "actors list",
  fromJSON: (v) => v.map((a) => restoreClassFromJSON(a)),
  expandable: true,
  hidden: true,
}
const MapsListDef: PropDef<GameMap[]> = {
  type: "array",
  editable: false,
  hidden: true,
  watchChildren: false,
  default: () => [],
  toJSON: (v) => v.map((map) => map.toJSON()),
  format: (v) => "maps list",
  fromJSON: (v) => v.map((map) => restoreClassFromJSON(map)),
  expandable: true,
}
const CanvasesListDef: PropDef<SImage[]> = {
  type: "array",
  editable: false,
  hidden: true,
  watchChildren: false,
  default: () => [],
  toJSON: (v) => v.map((map) => map.toJSON()),
  format: (v) => "canvases list",
  fromJSON: (v) => v.map((map) => restoreClassFromJSON(map)),
  expandable: true,
}
const GameDocDefs: DefList<DocType> = {
  name: NameDef,
  sheets: SheetsListDef,
  maps: MapsListDef,
  actors: ActorsListDef,
  tests: TestsListDef,
  canvases: CanvasesListDef,
  fonts: PixelFontListDef,
  palette: PaletteDef,
  tileSize: SizeDef,
  camera: CameraPropDef,
  assets: ObjectListDef.copy().withHidden(false).withExpandable(true),
}

export function gen_canvas(tile: Tile, palette: ImagePalette) {
  const cache_canvas = document.createElement("canvas")
  cache_canvas.width = tile.getPropValue("size").w
  cache_canvas.height = tile.getPropValue("size").h
  const ctx = cache_canvas.getContext("2d") as CanvasRenderingContext2D
  drawEditableSprite(ctx, 1, tile, palette)
  return cache_canvas
}

export class GameDoc extends PropsBase<DocType> {
  private sprite_lookup: Map<string, Tile>
  private sprite_lookup_by_name: Map<string, Tile>
  private image_cache: Map<Tile, HTMLCanvasElement>

  constructor(opts?: PropValues<DocType>) {
    super(GameDocDefs, opts)
    this.sprite_lookup = new Map()
    this.sprite_lookup_by_name = new Map()
    this.image_cache = new Map()
  }

  lookup_sprite(id: string) {
    if (this.sprite_lookup.has(id)) return this.sprite_lookup.get(id)
    for (const sheet of this.getPropValue("sheets") as Sheet[]) {
      for (const tile of sheet.getPropValue("tiles") as Tile[]) {
        if (tile._id === id) {
          this.sprite_lookup.set(tile._id, tile)
          return tile
        }
      }
    }
    console.log("missing", id)
    return null
  }

  lookup_sprite_by_name(name: string): Tile | undefined {
    if (this.sprite_lookup_by_name.has(name)) return this.sprite_lookup_by_name.get(name)
    for (const sheet of this.getPropValue("sheets") as Sheet[]) {
      for (const tile of sheet.getPropValue("tiles") as Tile[]) {
        if (tile.getPropValue("name") === name) {
          // console.log("caching",id,tile.getPropValue('name'), tile.cache_canvas)
          this.sprite_lookup.set(tile._id, tile)
          this.sprite_lookup_by_name.set(tile.getPropValue("name"), tile)
          return tile
        }
      }
    }
    console.log("missing", name)
    return undefined
  }

  lookup_canvas(id: string) {
    const tile = this.lookup_sprite(id)
    if (tile) {
      if (!this.image_cache.has(tile)) {
        const can = gen_canvas(tile, this.getPropValue("palette"))
        this.image_cache.set(tile, can)
      }
      return this.image_cache.get(tile)
    }
  }

  markDirty(id: string) {
    const tile = this.lookup_sprite(id)
    if (tile) {
      this.image_cache.delete(tile)
    }
  }
}

CLASS_REGISTRY.register("Doc", GameDoc, GameDocDefs)

const DEFAULT_FONT = make_doc_from_json(StdFont)
PixelFontListDef.withDefault(() => [DEFAULT_FONT.getPropValue("fonts")[0]])
