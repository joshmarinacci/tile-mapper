import {Point, Size} from "josh_js_util"
import {describe, expect, it} from "vitest"

import {
    Actor,
    ActorType,
    appendToList,
    Sheet2,
    Sheet2Type,
    Tile2,
    TileType
} from "./data2"
import {CLASS_REGISTRY, restoreClassFromJSON} from "./json"
import {PICO8} from "./model"

describe('simple test', () => {

    it('should save a tile class', async () => {
        const tile = new Tile2({
            name:'my cool tile',
            size: new Size(4,3),
            blocking: true,
            palette: PICO8,
        })
        tile.setPixel(1, new Point(1,1))

        expect(tile.getPropValue('data').size()).toBe(4*3)
        const json = tile.toJSON()
        // console.log(json)
        expect(json.props).toBeTruthy()
        expect(json.props.name).toBe('my cool tile')
        expect(json.props.size.w).toBe(4)
        expect(json.props.data.w).toBe(4)
        expect(json.props.data.h).toBe(3)
        expect(json.props.data.data[0]).toBe(0)
        expect(json.props.data.data[4+1]).toBe(1)
        const tile2 = restoreClassFromJSON<TileType>(json)
        expect(tile2.getPropValue('name')).toBe('my cool tile')
        expect(tile2.getPropValue('size').w).toBe(4)
        expect(tile2.getPropValue('blocking')).toBe(true)
        expect(tile2.getPropValue('data').size()).toBe(4*3)
        expect(tile2.getPixel(new Point(0,0))).toBe(0)
        expect(tile2.getPixel(new Point(1,1))).toBe(1)

    })
    it('should save an actor class', async () => {
        const actor = new Actor({name:'hamlet', hitbox: new Size(30,30)})
        expect(actor.getPropValue('name')).toBe('hamlet')
        expect(actor.getPropValue("hitbox")).toBeTruthy()
        expect(actor.getPropValue('hitbox').w).toBe(30)

        const json = actor.toJSON()
        expect(json.props.name).toBe("hamlet")

        const actor2 = restoreClassFromJSON<ActorType>(json)
        expect(actor2.getPropValue('name')).toBe('hamlet')
        expect(actor2.getPropValue('hitbox').w).toBe(30)
        expect(actor._id).toBe(actor2._id)
    })
    it('should save a sheet class', async () => {
        const tile = new Tile2({name:'sky',palette:PICO8,size:new Size(4,4)})
        tile.setPixel(3,new Point(2,2))
        console.log(CLASS_REGISTRY)

        const sheet = new Sheet2({name:'terrain',tileSize: new Size(4,4)})
        appendToList(sheet,'tiles',tile)
        expect(sheet.getPropValue('tiles').length).toBe(1)
        expect(sheet.getPropValue('tiles')[0].getPropValue('name')).toBe('sky')
        expect(sheet.getPropValue('tiles')[0].getPropValue('data').get_at(2,2)).toBe(3)

        const json = sheet.toJSON()
        console.log("sheet JSON",JSON.stringify(json,null,'  '))
        // console.log('tile',json.props.tiles[0])

        expect(json.props.name).toBe('terrain')
        expect(json.props.tiles.length).toBe(1)
        expect(json.props.tiles[0].props.name).toBe('sky')
        expect(json.props.tiles[0]['class']).toBe('Tile2')

        const sheet2 = restoreClassFromJSON<Sheet2Type>(json)
        console.log("tiles is",sheet2.getPropValue('tiles'))
        expect(sheet2.getPropValue('name')).toBe('terrain')
        expect(sheet2.getPropValue('tiles').length).toBe(1)
        expect(sheet2.getPropValue('tiles')[0].getPropValue('name')).toBe('sky')
        expect(sheet2.getPropValue('tiles')[0].getPropValue('data').get_at(2,2)).toBe(3)


    })
})
