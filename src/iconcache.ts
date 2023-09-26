import Icons from "./icons.json"
import {make_doc_from_json} from "./io/json"
import {Tile} from "./model/datamodel"

class IconCache {
    private icons: Map<string,string>
    constructor() {
        this.icons = new Map()
    }
    register(tile:Tile) {
        if(!tile.cache_canvas) tile.rebuild_cache()
        if(tile.cache_canvas) {
            const img_url = tile.cache_canvas.toDataURL('png')
            this.icons.set(tile.getPropValue('name'), img_url)
        }
    }
    getIconUrl(name:string) {
        return this.icons.get(name)
    }
}

export const ICON_CACHE = new IconCache()
const ICONS_DOC = make_doc_from_json(Icons)
ICONS_DOC.getPropValue('sheets').forEach(sheet => {
    sheet.getPropValue('tiles').forEach(tile => {
        ICON_CACHE.register(tile)
    })
})
