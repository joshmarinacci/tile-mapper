import "fake-indexeddb/auto"

import { IndexedDBImpl } from "dbobject_api_ts"
// import { IDBFactory } from "fake-indexeddb";
import { make_logger, Point, Size } from "josh_js_util"
import { describe, expect, it } from "vitest"

import { appendToList, restoreClassFromJSON } from "../model/base"
import { GameDoc, Sheet, Tile } from "../model/datamodel"
// indexedDB = new IDBFactory();

// import { appendToList, CLASS_REGISTRY, restoreClassFromJSON } from "../model/base"
// import { Actor, GameMap, PixelFont, PixelGlyph, Sheet, Tile, TileLayer } from "../model/datamodel"

const logger = make_logger("DB")
describe("database tests", () => {
  it("should save and reload  standalone a tile class", async () => {
    const tile = new Tile({
      name: "my cool tile",
      size: new Size(4, 3),
      blocking: true,
    })
    tile.setPixel(1, new Point(1, 1))
    expect(tile.getPropValue("data").size()).toBe(4 * 3)

    const json = tile.toJSON()
    console.log("tile json is", json)
    const db = new IndexedDBImpl()
    await db.open()
    const doc1_result = await db.new_object(json)
    logger.info("doc1 is", doc1_result, doc1_result.data[0])

    // get the object a second time by UUID
    const doc1_result2 = await db.get_object(doc1_result.data[0].uuid)
    logger.info("doc 1 result is", doc1_result2.data[0])

    const tile2 = restoreClassFromJSON(doc1_result2.data[0].props) as Tile
    // logger.info('tile2 is',tile2)

    expect(tile2.getPropValue("name")).toBe("my cool tile")
    expect(tile2.getPropValue("size").w).toBe(4)
    expect(tile2.getPropValue("blocking")).toBe(true)
    expect(tile2.getPropValue("data").size()).toBe(4 * 3)
    // expect(tile2.getPixel(new Point(0, 0))).toBe(0)
    // expect(tile2.getPixel(new Point(1, 1))).toBe(1)
    await db.destroy()
  })
  it("should save and reload an entire game doc", async () => {
    const doc = new GameDoc()
    const sheet = new Sheet()
    appendToList(doc, "sheets", sheet)
    // const json = doc.toJSON()

    const db = new IndexedDBImpl()
    await db.open()
    const res = await db.new_object(doc.toJSON())
    const stored_obj = await db.get_object(res.data[0].uuid)
    const doc2 = restoreClassFromJSON(stored_obj.data[0].props)
    console.log("doc 2 is", doc2)
    await db.destroy()
  })
  it("it should be able to query a list of docs", async () => {
    const db = new IndexedDBImpl()
    await db.open()

    // create and save doc
    {
      const doc = new GameDoc()
      const sheet = new Sheet()
      appendToList(doc, "sheets", sheet)
      const res = await db.new_object(doc.toJSON())
      console.log("res is", res, res.data[0])
    }

    // search for a doc
    {
      const res = await db.search({
        and: [
          {
            prop: "class",
            op: "equals",
            value: "Doc",
          },
        ],
      })
      const doc_json = res.data[0].props
      console.log("got back the result", res, doc_json)
      console.log("the doc name is ", doc_json.props.name)
      const doc2 = restoreClassFromJSON(doc_json)
      console.log("doc2 is", doc2)
    }
    // const doc2 = restoreClassFromJSON(stored_obj.data[0].props)
    // console.log("doc 2 is",doc2)
    await db.destroy()
  })
  it("should be able to delete a document", async () => {
    const doc = new GameDoc()
    const sheet = new Sheet()
    appendToList(doc, "sheets", sheet)

    const db = new IndexedDBImpl()
    await db.open()

    {
      const objs = await db.get_all_objects()
      expect(objs.success).toBeTruthy()
      expect(objs.data.length).toBe(0)
    }

    const new_result = await db.new_object(doc.toJSON())
    expect(new_result.success).toBeTruthy()
    expect(new_result.data.length).toBe(1)

    const objs = await db.get_all_objects()
    expect(objs.success).toBeTruthy()
    expect(objs.data.length).toBe(1)
    const delete_result = await db.delete_object(new_result.data[0].uuid)
    console.log(delete_result)
    // expect(delete_result.success).toBeTruthy()

    {
      const objs = await db.get_all_objects()
      expect(objs.success).toBeTruthy()
      expect(objs.data.length).toBe(0)
    }
  })
})

//- [ ] Save. And version if already exists.
// - [ ] List only latest versions
// - [ ] Delete all
// - [ ] Delete specific items. Really just marks as deleted
// - [ ] Queries won’t return deleted unless special flag
// - [ ] Destroy should be considered dangerous
