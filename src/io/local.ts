import { make_logger, Size } from "josh_js_util"

import { GameDoc } from "../model/datamodel"
import { GlobalState } from "../state"
import { docToJSON, JSONDocV5, make_doc_from_json, TILE_MAPPER_DOCUMENT } from "./json"

export type JSONDocReference = {
  uuid: string
  name: string
  kind: string
  thumbnail?: string
  creationDate: Date
  updateDate: Date
}
export type JSONDocIndex = {
  docs: JSONDocReference[]
}

function loadIndex(state: GlobalState): JSONDocIndex {
  const index = state.localStorage.getItem("index")
  if (index) {
    return JSON.parse(index) as JSONDocIndex
  } else {
    return { docs: [] }
  }
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

export async function saveLocalStorage(state: GlobalState, withThumbnail: boolean) {
  // const log = make_logger('local')
  const json_obj = docToJSON(state.getPropValue("doc"))
  console.log("generated json", json_obj)
  const doc = state.getPropValue("doc")
  // log.info('json is',json_obj)
  //first save the doc itself
  state.localStorage.setItem(doc.getUUID(), JSON.stringify(json_obj, null, "    "))
  //now save a thumbnail
  let thumbnail_url = ""
  if (withThumbnail) {
    const canvas = await stateToCanvas(state)
    const thumbnail = scaleCropCanvasTo(canvas, new Size(64, 64))
    thumbnail_url = thumbnail.toDataURL("png")
  }

  const index: JSONDocIndex = loadIndex(state)
  console.log("index before is", index)
  const old_doc = index.docs.find((dr) => dr.uuid === doc.getUUID())
  if (old_doc) {
    old_doc.name = doc.getPropValue("name")
    old_doc.updateDate = new Date(Date.now())
    old_doc.thumbnail = thumbnail_url
    old_doc.kind = TILE_MAPPER_DOCUMENT
  } else {
    index.docs.push({
      kind: TILE_MAPPER_DOCUMENT,
      uuid: doc.getUUID(),
      name: doc.getPropValue("name"),
      creationDate: new Date(Date.now()),
      updateDate: new Date(Date.now()),
      thumbnail: thumbnail_url,
    })
  }
  console.log("saving back the index", index)
  state.localStorage.setItem("index", JSON.stringify(index, null, "    "))
}

export async function listLocalDocs(state: GlobalState) {
  return loadIndex(state).docs
}
export async function loadLocalDoc(state: GlobalState, uuid: string): Promise<GameDoc> {
  const log = make_logger("local")
  const index: JSONDocIndex = loadIndex(state)
  log.info("the index is", index)
  const docref = index.docs.find((dr) => dr.uuid === uuid)
  log.info("docref is", docref)
  const json = state.localStorage.getItem(uuid)
  if (json) {
    const obj: JSONDocV5 = JSON.parse(json)
    return make_doc_from_json(obj)
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
