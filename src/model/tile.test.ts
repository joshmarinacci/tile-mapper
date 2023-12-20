import { Point, Size } from "josh_js_util"
import { describe, expect, it } from "vitest"

import { make_doc_from_json } from "../io/json"
import Icons from "../resources/icons.json"
import { restoreClassFromJSON } from "./base"
import { get_class_registry } from "./index"
import { Tile } from "./tile"

describe("tile json persistence", () => {
  it("should save a Tile to JSON", async () => {
    const reg = get_class_registry()
    const tile = new Tile({
      name: "my cool tile",
      size: new Size(4, 3),
      blocking: true,
    })
    tile.setPixel(1, new Point(1, 1))

    expect(tile.getPropValue("data").size()).toEqual(new Size(4, 3))
    const json = tile.toJSON(reg)
    console.log(json)
    expect(json.props).toBeTruthy()
    expect(json.props.name).toBe("my cool tile")
    expect(json.props.size.w).toBe(4)
    expect(json.props.data.props.size.w).toBe(4)
    expect(json.props.data.props.size.h).toBe(3)
    // expect(json.props.data.data[0]).toBe(0)
    // expect(json.props.data.data[4 + 1]).toBe(1)
  })
  it("should restore a Tile from JSON", async () => {
    const reg = get_class_registry()
    const tile = new Tile({
      name: "my cool tile",
      size: new Size(4, 3),
      blocking: true,
    })
    tile.setPixel(1, new Point(1, 1))
    const json = tile.toJSON(reg)

    const tile2 = restoreClassFromJSON(reg, json)
    expect(tile2.getPropValue("name")).toBe("my cool tile")
    expect(tile2.getPropValue("size").w).toBe(4)
    expect(tile2.getPropValue("blocking")).toBe(true)
    // console.log("data is",tile2.getPropValue('data'))
    expect(tile2.getPropValue("data").size()).toEqual(new Size(4, 3))
    expect(tile2.getPixel(new Point(0, 0))).toBe(-1)
    expect(tile2.getPixel(new Point(1, 1))).toBe(1)
  })
  it("should restore tile with the old data type", async () => {
    const reg = get_class_registry()
    const ICONS_DOC = make_doc_from_json(Icons, reg)
  })
})
