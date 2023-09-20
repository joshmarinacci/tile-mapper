Tile mapper data model


todos:
 let you add a new sprite sheet
 comment out the old model classes
 let you resize a tile layer from the props
 improve listening to changes and updating
 make map editor bigger
 make persistence work again
 add array property edit hooks to fire changes properly
 [x] ex: sheet.removeTile()


Doc has
    palette: string[]
    name: string
    sheets: Sheet[]
        name: string
        tileSize: Size
        tile: Tile[]
            name:string
            blocking:boolean
            data:array of nums
    maps: Map[]
        name: string
        layers: Layer[]
            name: string
            type: string
            blocking: boolean
            visible: boolean
            TileLayer: 
                size
            ActorLayer:
                ?
    tests: Test[]
        name: string
        map: mapref
        viewport: Size,
    actors:
        name: string
        hitbox: Bounds
        viewbox: Bounds
