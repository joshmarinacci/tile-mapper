import { Point, Size } from "josh_js_util"

import { appendToList, DefList, PropDef, PropsBase, PropValues, restoreClassFromJSON } from "./base"
import { BooleanDef, NameDef, SizeDef, StringDef } from "./datamodel"
import { Tile } from "./tile"

type SheetType = {
  name: string
  tileSize: Size
  tiles: Tile[]
  selectedTile: Tile | undefined
  showNames: boolean
  showGrid: boolean
  showBlocking: boolean
  locked: boolean
  viewMode: "list" | "grid"
}
const TileArrayDef: PropDef<Tile[]> = {
  type: "array",
  editable: false,
  hidden: true,
  expandable: true,
  watchChildren: true,
  default: () => [],
  format: (v) => "list of tiles",
  toJSON: (r, v) => v.map((t) => t.toJSON(r)),
  fromJSON: (r, value) => {
    const v = value as []
    return v.map((d) => restoreClassFromJSON(r, d)) as Tile[]
  },
}
export const TransientBooleanDef = BooleanDef.copy().withSkipPersisting(true).withHidden(true)
export const SheetDefs: DefList<SheetType> = {
  name: NameDef,
  tileSize: SizeDef.copy().withEditable(false),
  tiles: TileArrayDef,
  selectedTile: {
    type: "object",
    hidden: true,
    default: () => undefined,
    expandable: false,
    editable: false,
    watchChildren: false,
    skipPersisting: true,
  },
  showNames: TransientBooleanDef.copy().withDefault(() => false),
  showGrid: TransientBooleanDef,
  showBlocking: TransientBooleanDef.copy().withDefault(() => false),
  locked: TransientBooleanDef,
  viewMode: StringDef.withDefault(() => "list").withHidden(true),
}

export class Sheet extends PropsBase<SheetType> {
  constructor(opts?: PropValues<SheetType>) {
    super(SheetDefs, opts)
  }

  addTile(new_tile: Tile) {
    appendToList(this, "tiles", new_tile)
  }

  removeTile(tile: Tile) {
    const tiles = this.getPropValue("tiles") as Tile[]
    const n = tiles.indexOf(tile)
    if (n >= 0) {
      tiles.splice(n, 1)
      this.setPropValue("tiles", tiles.slice())
    } else {
      console.warn("cannot delete sprite")
    }
  }

  addNewTile() {
    const size = this.getPropValue("tileSize")
    const tile = new Tile({ size: size, gridPosition: new Point(-1, -1) })
    this.addTile(tile)
    return tile
  }

  hasTiles() {
    return this.getPropValue("tiles").length > 0
  }

  firstTile() {
    return this.getPropValue("tiles")[0]
  }
}
