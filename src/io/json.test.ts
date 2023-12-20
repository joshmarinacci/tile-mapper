import { Point, Size } from "josh_js_util"
import { describe, expect, it } from "vitest"

import { get_class_registry } from "../model"
import { Actor } from "../model/actor"
import { appendToList, restoreClassFromJSON } from "../model/base"
import { GameMap, TileLayer } from "../model/gamemap"
import { Sheet } from "../model/sheet"
import { Tile } from "../model/tile"

function log(...args: unknown[]) {
  console.log("JSON TEST", ...args)
}

describe("simple test", () => {
  it("should save an actor class", async () => {
    const reg = get_class_registry()
    const actor = new Actor({ name: "hamlet", hitbox: new Size(30, 30) })
    expect(actor.getPropValue("name")).toBe("hamlet")
    expect(actor.getPropValue("hitbox")).toBeTruthy()
    expect(actor.getPropValue("hitbox").w).toBe(30)

    const json = actor.toJSON(reg)
    expect(json.props.name).toBe("hamlet")

    const actor2 = restoreClassFromJSON(json)
    expect(actor2.getPropValue("name")).toBe("hamlet")
    expect(actor2.getPropValue("hitbox").w).toBe(30)
    expect(actor._id).toBe(actor2._id)
  })
  it("should save a sheet class", async () => {
    const reg = get_class_registry()
    const tile = new Tile({ name: "sky", size: new Size(4, 4) })
    tile.setPixel(3, new Point(2, 2))
    console.log(CLASS_REGISTRY)

    const sheet = new Sheet({ name: "terrain", tileSize: new Size(4, 4) })
    appendToList(sheet, "tiles", tile)
    expect(sheet.getPropValue("tiles").length).toBe(1)
    expect(sheet.getPropValue("tiles")[0].getPropValue("name")).toBe("sky")
    expect(sheet.getPropValue("tiles")[0].getPropValue("data").get_at(2, 2)).toBe(3)

    const json = sheet.toJSON()
    console.log("sheet JSON", JSON.stringify(json, null, "  "))
    // console.log('tile',json.props.tiles[0])

    expect(json.props.name).toBe("terrain")
    expect(json.props.tiles.length).toBe(1)
    expect(json.props.tiles[0].props.name).toBe("sky")
    expect(json.props.tiles[0]["class"]).toBe("Tile")

    const sheet2 = restoreClassFromJSON(json)
    console.log("tiles is", sheet2.getPropValue("tiles"))
    expect(sheet2.getPropValue("name")).toBe("terrain")
    expect(sheet2.getPropValue("tiles").length).toBe(1)
    expect(sheet2.getPropValue("tiles")[0].getPropValue("name")).toBe("sky")
    expect(sheet2.getPropValue("tiles")[0].getPropValue("data").get_at(2, 2)).toBe(3)
  })
  it("should save a tile layer", async () => {
    const reg = get_class_registry()
    const layer1 = new TileLayer({
      type: "tile-layer",
      name: "first layer",
      size: new Size(2, 2),
      visible: true,
      blocking: false,
    })
    layer1.getPropValue("data").set_at(1, 1, { tile: "foo" })
    expect(layer1.getPropValue("data").size()).toBe(4)
    expect(layer1.getPropValue("data").get_at(1, 1)).toStrictEqual({
      tile: "foo",
    })
    const json = layer1.toJSON(reg)
    log(json.props["data"])
    expect(json.class).toBe("TileLayer")
    expect(json.props["data"]).toBeTruthy()
    expect(json.props["data"].w).toBe(2)
    expect(json.props["data"]["data"]).toBeTruthy()
    expect(json.props["data"]["data"][0].tile).toBe("unknown")
    expect(json.props["data"]["data"][3].tile).toBe("foo")

    const layer2 = restoreClassFromJSON(json)
    log(layer2.getPropValue("data"))
    expect(layer2._id).toBe(layer1._id)
    expect(layer2.getPropValue("name")).toBe(layer1.getPropValue("name"))
    expect(layer2.getPropValue("data").w).toBe(2)
    expect(layer2.getPropValue("size") instanceof Size).toBeTruthy()
    expect(layer2.getPropValue("data").get_at(0, 0)).toStrictEqual({
      tile: "unknown",
    })
    expect(layer2.getPropValue("data").get_at(1, 1)).toStrictEqual({
      tile: "foo",
    })
    expect(layer2.getPropValue("blocking")).toBeFalsy()
    expect(layer2.getPropValue("visible")).toBeTruthy()
  })
  it("should save a map with a tile layer", async () => {
    const map1 = new GameMap({ name: "my map" })
    const layer1 = new TileLayer({
      type: "tile-layer",
      name: "first layer",
      size: new Size(2, 2),
      visible: true,
      blocking: false,
    })
    layer1.getPropValue("data").set_at(1, 1, { tile: "foo" })
    appendToList(map1, "layers", layer1)

    expect(map1.getPropValue("name")).toBe("my map")
    expect(map1.getPropValue("layers").length).toBe(1)

    const json = map1.toJSON()
    log(json)
    // log(json.props.layers)
    // log(json.props.layers[0].props.data)

    expect(json.props.name).toBe("my map")
    expect(json.props.layers.length).toBe(1)
    expect(json.props.layers[0].props.name).toBe("first layer")
    expect(json.props.layers[0].props.data.w).toBe(2)

    const map2 = restoreClassFromJSON(json)
    log(map2)
    expect(map2.getPropValue("name")).toBe("my map")
    expect(map2.getPropValue("layers").length).toBe(1)
    expect(map2.getPropValue("layers")[0] instanceof TileLayer).toBeTruthy()
    const layer2 = map2.getPropValue("layers")[0] as TileLayer
    expect(layer2.getPropValue("name")).toBe("first layer")
    expect(layer2.getPropValue("blocking")).toBe(false)
    expect(layer2.getPropValue("data").w).toBe(2)
    expect(layer2.getPropValue("data").get_at(1, 1)).toStrictEqual({
      tile: "foo",
    })
  })
  it("should save a sheet but not persist the selection", async () => {
    const reg = get_class_registry()
    const tile = new Tile({ name: "sky", size: new Size(4, 4) })
    tile.setPixel(3, new Point(2, 2))
    const sheet = new Sheet({ name: "terrain", tileSize: new Size(4, 4) })
    appendToList(sheet, "tiles", tile)
    expect(sheet.getPropValue("selectedTile")).toBeFalsy()
    const json = sheet.toJSON()
    console.log("sheet JSON", JSON.stringify(json, null, "  "))
    const sheet2 = restoreClassFromJSON(json)
    expect(sheet2).toBeTruthy()
    expect(sheet2.getPropValue("selectedTile")).toBeFalsy()
  })
})
