import {TileReference} from "./globals"

type JSONTileSprite = {
    id: string,
    name: string,
    h: number,
    w: number,
    blocking: boolean,
    data: number[]
}
type JSONTileSheet = {
    id: string,
    name: string,
    sprites: JSONTileSprite[]
}
type hexcolor = string
export type JSONGameStruct = {
    version: number,
    name: string
    color_palette: hexcolor[]
    sheets: JSONTileSheet[]
    maps: any[]
    tests: any[]
}
export type CachedTile = {
    name: string,
    id: string,
    canvas: HTMLCanvasElement,
    blocking: boolean
}

export class TileCache {
    private cacheByTileName: Map<string, CachedTile>
    private cacheByTileUUID: Map<string, CachedTile>

    constructor() {
        this.cacheByTileName = new Map()
        this.cacheByTileUUID = new Map()
    }

    addCachedTile(name:string, uuid:string, cached:CachedTile) {
        this.cacheByTileName.set(name,cached)
        this.cacheByTileUUID.set(uuid,cached)
        if(name !== 'unnamed')
            this.log("caching",cached)
    }
    loadSheet(sheet: JSONTileSheet, palette: hexcolor[]) {
        sheet.sprites.forEach(sprite => {
            const canvas = this.spriteToCanvas(sprite, palette)
            const cached: CachedTile = {
                name: sprite.name,
                id: sprite.id,
                canvas: canvas,
                blocking: sprite.blocking
            }
            this.cacheByTileName.set(sprite.name, cached)
            this.cacheByTileUUID.set(sprite.id, cached)
            if(sprite.name !== 'unnamed')
                this.log("caching",cached)
        })
    }

    getTileByName(tile: TileReference) {
        return this.cacheByTileUUID.get(tile.uuid)
    }

    private spriteToCanvas(sprite: JSONTileSprite, palette: hexcolor[]) {
        const canvas = document.createElement('canvas')
        canvas.width = sprite.w
        canvas.height = sprite.h
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
        ctx.fillStyle = 'transparent'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        for (let j = 0; j < sprite.h; j++) {
            for (let i = 0; i < sprite.w; i++) {
                const v = sprite.data[j * sprite.w + i]
                ctx.fillStyle = palette[v]
                ctx.fillRect(i, j, 1, 1)
            }
        }
        return canvas
    }

    private log(...args:unknown[]) {
        console.log('TileCache',...args)
    }
}
