import { forceDownloadBlob } from "josh_web_util"

import { canvas_to_bmp, sheet_to_canvas } from "../common/common"
import { Icons } from "../common/icons"
import { IndexeddbDocumentStorage } from "../io/indexeddb"
import {
  docToJSON,
  fileToJson,
  JSONDocV5,
  jsonObjToBlob,
  make_doc_from_json,
  Metadata,
  savePNGJSON,
} from "../io/json"
import { readMetadata } from "../io/vendor"
import { get_class_registry } from "../model"
import { GameDoc } from "../model/gamedoc"
import { GlobalState } from "../state"
import { SimpleMenuAction } from "./actions"

export const DocToBMP: SimpleMenuAction = {
  type: "simple",
  title: "to BMP",
  async perform(state) {
    const doc = state.getPropValue("doc") as GameDoc
    const sheet = doc.getPropValue("sheets")[0]
    const canvas = sheet_to_canvas(sheet, doc.getPropValue("palette"))
    const rawData = canvas_to_bmp(canvas, doc.getPropValue("palette"))
    const blob = new Blob([rawData.data], { type: "image/bmp" })
    forceDownloadBlob(`${sheet.getPropValue("name")}.bmp`, blob)
  },
}
export const ExportToJSONAction: SimpleMenuAction = {
  type: "simple",
  title: "Export to JSON",
  async perform(state): Promise<void> {
    const doc = state.getPropValue("doc") as GameDoc
    const blob = jsonObjToBlob(docToJSON(get_class_registry(), doc))
    forceDownloadBlob(`${doc.getPropValue("name")}.json`, blob)
  },
}
export const ImportFromJSONAction: SimpleMenuAction = {
  type: "simple",
  title: "import plain JSON",
  async perform(state: GlobalState) {
    const input_element = document.createElement("input")
    input_element.setAttribute("type", "file")
    input_element.style.display = "none"
    document.body.appendChild(input_element)
    const new_doc = await new Promise<GameDoc>((res) => {
      input_element.addEventListener("change", () => {
        const files = input_element.files
        if (!files || files.length <= 0) return
        const file = files[0]
        fileToJson(file).then((data) =>
          res(make_doc_from_json(data as object, get_class_registry())),
        )
      })
      input_element.click()
    })
    console.log("new doc is", new_doc)
    state.setPropValue("doc", new_doc)
    state.setSelection(new_doc)
  },
}
export const SaveLocalStorageAction: SimpleMenuAction = {
  type: "simple",
  icon: Icons.Save,
  title: "Save",
  description: "save the document in the browsers internal storage",
  tags: ["save", "local"],
  shortcut: {
    key: "s",
    meta: true,
    alt: false,
    control: false,
    shift: false,
  },
  perform: async (state) => {
    state.getPropValue("toaster").fireMessage("saving")
    // const db = new JoshDBDocumentStorage()
    const db = new IndexeddbDocumentStorage()
    await db.saveLocalDoc(state)
    state.getPropValue("toaster").fireMessage("saved")
  },
}

export async function loadPNGJSON(state: GlobalState, file: File): Promise<GameDoc> {
  return new Promise((res, rej) => {
    const reader = new FileReader()
    reader.addEventListener("load", () => {
      const buffer = new Uint8Array(reader.result as ArrayBufferLike)
      const metadata = readMetadata(buffer as Buffer) as unknown as Metadata
      console.log("metadata is", metadata)
      if (metadata && metadata.tEXt && metadata.tEXt.SOURCE) {
        const json = JSON.parse(metadata.tEXt.SOURCE)
        const obj = make_doc_from_json(json as JSONDocV5, get_class_registry())
        res(obj)
      }
    })
    reader.addEventListener("error", () => rej())
    reader.readAsArrayBuffer(file)
  })
}

export const SavePNGJSONAction: SimpleMenuAction = {
  type: "simple",
  // icon:SupportedIcons.SaveDocument,
  title: "Save As doc.JSON.PNG",
  description: "Save the document as a PNG with the document embedded inside of the PNG as JSON.",
  tags: ["save", "export", "download", "png"],
  perform: async (state) => {
    await savePNGJSON(state)
  },
}
