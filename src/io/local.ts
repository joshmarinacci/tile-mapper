import { IndexedDBImpl, JDObject } from "dbobject_api_ts"

import { get_class_registry } from "../model"
import { restoreClassFromJSON } from "../model/base"
import { GameDoc } from "../model/gamedoc"
import { ImageSnapshotCache } from "../model/ImageSnapshotCache"
import { GlobalState } from "../state"
import { DocumentStorage, JSONDocReference } from "./storage"

export class JoshDBDocumentStorage implements DocumentStorage {
  async saveLocalDoc(state: GlobalState) {
    const doc = state.getPropValue("doc")
    const db = new IndexedDBImpl()
    await db.open()
    // if (false) {
    //   await db.destroy()
    //   console.log("deleted all docs")
    // }
    const res = await db.search({
      and: [
        {
          prop: "class",
          op: "equals",
          value: "Doc",
        },
        {
          prop: "id",
          op: "equals",
          value: doc.getUUID(),
        },
      ],
    })
    console.log("res is", res)
    if (res.success && res.data.length >= 1) {
      console.log("there is an existing doc, need to update it", res.data)
      const json = doc.toJSON(get_class_registry())
      const res2 = await db.update_object_props(res.data[0].uuid, json)
      console.log("res is", res2)
      console.log("saved")
    } else {
      console.log("no existing doc, make a enw one")
      const res2 = await db.new_object(doc.toJSON(get_class_registry()))
      console.log("res is", res2)
      console.log("saved")
    }
  }

  async listLocalDocs(state: GlobalState): Promise<JSONDocReference[]> {
    const db = new IndexedDBImpl()
    await db.open()
    const res = await db.search({
      and: [
        {
          prop: "class",
          op: "equals",
          value: "Doc",
        },
      ],
    })
    const versions = new Map<string, number>()
    res.data.forEach((doc_node) => {
      const uuid = doc_node.uuid
      const version = doc_node.version
      if (!versions.has(uuid)) {
        versions.set(uuid, version)
        return
      } else {
        const cur_ver = versions.get(uuid) as number
        if (version > cur_ver) {
          versions.set(doc_node.uuid, doc_node.version)
        }
      }
    })
    console.log("versions are", versions)
    const unique: JDObject[] = (res.data as JDObject[]).filter(
      (node: JDObject) => versions.has(node.uuid) && versions.get(node.uuid) === node.version,
    )
    const doc_list = unique.map((doc_node) => {
      console.log("doc is", doc_node)
      const docr: JSONDocReference = {
        name: doc_node.props.props.name,
        uuid: doc_node.uuid,
      }
      return docr
      // return doc_node.props.props.name
    })
    console.log("got back docs", doc_list)
    return doc_list
  }

  async loadLocalDoc(state: GlobalState, uuid: string, isc: ImageSnapshotCache): Promise<GameDoc> {
    const db = new IndexedDBImpl()
    await db.open()
    const res = await db.get_object(uuid)
    if (res.success) {
      const doc_json = res.data[0].props
      const doc2 = restoreClassFromJSON(get_class_registry(), doc_json) as GameDoc
      doc2
        .getPropValue("canvases")
        .forEach((img) => isc.setImageSnapshot(img.getUUID(), img.toSimpleCanvas(doc2)))
      return doc2
    } else {
      throw new Error(`no such document with uuid: ${uuid}`)
    }
  }

  async deleteLocalDoc(state: GlobalState, uuid: string): Promise<void> {
    console.log("deleting", uuid)
    const db = new IndexedDBImpl()
    await db.open()
    const res = await db.get_object(uuid)
    console.log("res is", res)
    const rest2 = await db.delete_object(res.data[0].uuid)
    console.log("res2", rest2)
    // return listLocalDocs(state)
    // const index: JSONDocIndex = loadIndex(state)
    // const docref = index.docs.find((dr) => dr.uuid === uuid)
    // if (!docref) return
    // index.docs = index.docs.filter((doc) => doc.uuid !== uuid)
    // state.localStorage.setItem("index", JSON.stringify(index, null, "    "))
  }
}
