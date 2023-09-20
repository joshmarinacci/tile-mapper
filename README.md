Tile mapper data model

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
