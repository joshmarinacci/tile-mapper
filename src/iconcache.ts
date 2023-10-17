import { ImagePalette } from "./common/common"
import Icons from "./icons.json"
import { make_doc_from_json } from "./io/json"
import { gen_canvas, Tile } from "./model/datamodel"

class IconCache {
  private icons: Map<string, string>
  private icons_canvas: Map<string, HTMLCanvasElement>

  constructor() {
    this.icons = new Map()
    this.icons_canvas = new Map<string, HTMLCanvasElement>()
  }

  register(tile: Tile, palette: ImagePalette) {
    const canvas = gen_canvas(tile, palette)
    const img_url = canvas.toDataURL("png")
    this.icons.set(tile.getPropValue("name"), img_url)
    this.icons_canvas.set(tile.getPropValue("name"), canvas)
  }

  getIconUrl(name: string) {
    return this.icons.get(name) as string
  }

  getIconCanvas(name: string): HTMLCanvasElement {
    if (!this.icons_canvas.get(name)) throw new Error(`missing icon: ${name}`)
    return this.icons_canvas.get(name) as HTMLCanvasElement
  }
}

export const ICON_CACHE = new IconCache()
const ICONS_DOC = make_doc_from_json(Icons)
ICONS_DOC.getPropValue("sheets").forEach((sheet) => {
  sheet.getPropValue("tiles").forEach((tile) => {
    ICON_CACHE.register(tile, ICONS_DOC.getPropValue("palette"))
  })
})
