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
  locked: boolean
  viewMode: "list" | "grid"
}
const TileArrayDef: PropDef<Tile[]> = {
  type: "array",
  editable: false,
  hidden: true,
  expandable: false,
  watchChildren: true,
  default: () => [],
  toJSON: (v) => v.map((t) => t.toJSON()),
  format: (v) => "list of tiles",
  fromJSON: (value) => {
    const v = value as []
    return v.map((d) => restoreClassFromJSON(d)) as Tile[]
  },
}
export const TransientBooleanDef = BooleanDef.copy().withSkipPersisting(true).withHidden(true)
export const SheetDefs: DefList<SheetType> = {
  name: NameDef,
  tileSize: SizeDef,
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
  showNames: TransientBooleanDef,
  showGrid: TransientBooleanDef,
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
}
