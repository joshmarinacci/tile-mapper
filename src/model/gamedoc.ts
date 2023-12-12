import { Size } from "josh_js_util"

import { drawEditableSprite, ImagePalette } from "../common/common"
import { Actor } from "./actor"
import { DefList, PropDef, PropsBase, PropValues, restoreClassFromJSON } from "./base"
import { Camera, CameraPropDef } from "./camera"
import { NameDef, ObjectListDef, PaletteDef, SizeDef } from "./datamodel"
import { GameMap } from "./gamemap"
import { SImage } from "./image"
import { PhysicsSettings, PhysicsSettingsPropDef } from "./physicsSettings"
import { PixelFont, PixelFontListDef } from "./pixelfont"
import { Sheet } from "./sheet"
import { Tile } from "./tile"

export type DocType = {
  name: string
  sheets: Sheet[]
  maps: GameMap[]
  actors: Actor[]
  canvases: SImage[]
  fonts: PixelFont[]
  palette: ImagePalette
  tileSize: Size
  assets: PropsBase<unknown>[]
  camera: Camera
  physics: PhysicsSettings
}

const SheetsListDef: PropDef<Sheet[]> = {
  type: "array",
  editable: false,
  hidden: true,
  watchChildren: false,
  default: () => [],
  toJSON: (v) => v.map((sheet: Sheet) => sheet.toJSON()),
  format: (v) => "sheets list",
  fromJSON: (v) => v.map((sheet) => restoreClassFromJSON(sheet)),
  expandable: true,
}
const ActorsListDef: PropDef<Actor[]> = {
  type: "array",
  editable: false,
  watchChildren: false,
  default: () => [],
  toJSON: (v) => v.map((actor: Actor) => actor.toJSON()),
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
export const GameDocDefs: DefList<DocType> = {
  name: NameDef,
  sheets: SheetsListDef,
  maps: MapsListDef,
  actors: ActorsListDef,
  canvases: CanvasesListDef,
  fonts: PixelFontListDef,
  palette: PaletteDef,
  tileSize: SizeDef.copy().withEditable(false),
  camera: CameraPropDef.withHidden(true),
  physics: PhysicsSettingsPropDef.withHidden(true),
  assets: ObjectListDef.copy().withHidden(true).withExpandable(true),
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

  palette() {
    return this.getPropValue("palette")
  }
  fonts() {
    return this.getPropValue("fonts")
  }
  sheets() {
    return this.getPropValue("sheets")
  }
  tilesSize() {
    return this.getPropValue("tileSize")
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
    // console.log("missing", id)
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
        const can = gen_canvas(tile, this.palette())
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
