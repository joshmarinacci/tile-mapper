import { IndexedDBImpl, JDObject } from "dbobject_api_ts"
import { Size } from "josh_js_util"

import { restoreClassFromJSON } from "../model/base"
import { GameDoc } from "../model/gamedoc"
import { GlobalState } from "../state"

export type JSONDocReference = {
  uuid: string
  name: string
  // kind: string
  // thumbnail?: string
  // creationDate: Date
  // updateDate: Date
}
export type JSONDocIndex = {
  docs: JSONDocReference[]
}

function scaleCropCanvasTo(original_canvas: HTMLCanvasElement, size: Size) {
  const new_canvas = document.createElement("canvas")
  new_canvas.width = size.w
  new_canvas.height = size.h
  const ctx = new_canvas.getContext("2d") as CanvasRenderingContext2D
  ctx.fillStyle = "white"
  ctx.fillRect(0, 0, size.w, size.h)
  ctx.fillStyle = "red"
  ctx.fillRect(0 + 10, 0 + 10, size.w - 20, size.h - 20)
  ctx.drawImage(
    original_canvas,
    0,
    0,
    original_canvas.width,
    original_canvas.height,
    0,
    0,
    size.w,
    size.h,
  )
  return new_canvas
}

export async function saveLocalDoc(state: GlobalState) {
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
    const res2 = await db.update_object_props(res.data[0].uuid, doc.toJSON())
    console.log("res is", res2)
    console.log("saved")
  } else {
    console.log("no existing doc, make a enw one")
    const res2 = await db.new_object(doc.toJSON())
    console.log("res is", res2)
    console.log("saved")
  }
}

export async function listLocalDocs(state: GlobalState): Promise<JSONDocReference[]> {
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

export async function loadLocalDoc(state: GlobalState, uuid: string): Promise<GameDoc> {
  const db = new IndexedDBImpl()
  await db.open()
  const res = await db.get_object(uuid)
  if (res.success) {
    const doc_json = res.data[0].props
    const doc2 = restoreClassFromJSON(doc_json) as GameDoc
    return doc2
  } else {
    throw new Error(`no such document with uuid: ${uuid}`)
  }
}

export async function deleteLocalDoc(state: GlobalState, uuid: string): Promise<void> {
  const index: JSONDocIndex = loadIndex(state)
  const docref = index.docs.find((dr) => dr.uuid === uuid)
  if (!docref) return
  index.docs = index.docs.filter((doc) => doc.uuid !== uuid)
  state.localStorage.setItem("index", JSON.stringify(index, null, "    "))
}
