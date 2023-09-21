Tile mapper data model


bugs:
    size of tiles incorrect after loading. reports ten in sheet, but clearly are 16 in the tiles

todos:
 [ ] support loading mario, but not saving out again. specific to V4
 [x] let you add a new sprite sheet
 [ ] comment out the old model classes
 [x] improve listening to changes and updating
 [ ] make map editor bigger. sheets and tiles on left, layers and full props on right. map in the middle. ? 
 [ ] make map editor canvas big as the biggest tile layer, and scroll
 [ ] make persistence work again
 [ ] add array property edit hooks to fire changes properly
 [x] ex: sheet.removeTile()
 [ ] add and remove map layers
 [ ] let you resize a tile layer from the props. destructive?
 [ ] fix width of cells of vertical list views

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
