import { openDB } from "idb"

import { get_class_registry } from "../model"
import { JsonOut, restoreClassFromJSON } from "../model/base"
import { DocType, GameDoc } from "../model/gamedoc"
import { ImageSnapshotCache } from "../model/ImageSnapshotCache"
import { GlobalState } from "../state"
import { DocumentStorage, JSONDocReference } from "./storage"

export class IndexeddbDocumentStorage implements DocumentStorage {
  async open() {
    const db = await openDB("foo", 1, {
      upgrade(db) {
        db.createObjectStore("bar")
      },
    })
    return db
  }
  async listLocalDocs(state: GlobalState): Promise<JSONDocReference[]> {
    const db = await this.open()
    const keys = await db.getAllKeys("bar")
    const docs = await db.getAll("bar")
    console.log("got the keys", docs)
    return docs.map((doc) => {
      return {
        name: doc.props.name,
        uuid: doc.id,
      }
    })
  }

  async saveLocalDoc(state: GlobalState): Promise<void> {
    const doc = state.getPropValue("doc")
    const json_doc = doc.toJSON(get_class_registry())
    console.log("saving doc", json_doc)
    const db = await this.open()
    await db.put("bar", json_doc, doc.getUUID())
    const restored = await db.get("bar", doc.getUUID())
    console.log("restored", restored)
  }

  async loadLocalDoc(state: GlobalState, uuid: string, isc: ImageSnapshotCache): Promise<GameDoc> {
    const db = await this.open()
    const restored = (await db.get("bar", uuid)) as JsonOut<DocType>
    console.log("loaded back", restored)

    const doc2 = restoreClassFromJSON(get_class_registry(), restored) as GameDoc
    doc2
      .getPropValue("canvases")
      .forEach((img) => isc.setImageSnapshot(img.getUUID(), img.toSimpleCanvas(doc2)))
    return doc2
  }
  deleteLocalDoc(state: GlobalState, uuid: string): Promise<void> {
    throw new Error("Method not implemented.")
  }
}
