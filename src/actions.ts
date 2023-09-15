import {canvas_to_blob, forceDownloadBlob} from "josh_web_util"

import {SimpleMenuAction} from "./base"
import {
    canvas_to_bmp,
    EditableDocument,
    fileToJson,
    jsonObjToBlob,
    make_doc_from_json,
    sheet_to_canvas
} from "./model"
import {GlobalState} from "./state"

export const SaveAction:SimpleMenuAction = {
    type: "simple",
    title: "Save",
    async perform(state): Promise<void> {
        const doc:EditableDocument = state.getPropValue('doc') as EditableDocument
        const blob = jsonObjToBlob(doc.toJSONDoc())
        forceDownloadBlob(`${doc.getPropValue('name')}.json`,blob)
    },
}

export const DocToPNG:SimpleMenuAction = {
    type: "simple",
    title: "to PNG",
    async perform(state): Promise<void> {
        const doc:EditableDocument = state.getPropValue('doc') as EditableDocument
        for(const sheet of doc.getSheets()) {
            const can = sheet_to_canvas(sheet)
            const blob = await canvas_to_blob(can)
            forceDownloadBlob(`${doc.getPropValue('name')}.${sheet.getPropValue('name')}.png`,blob)
        }
    }
}

export const DocToBMP:SimpleMenuAction = {
    type:'simple',
    title:'to BMP',
    async perform(state) {
        const doc:EditableDocument = state.getPropValue('doc') as EditableDocument
        const sheet = doc.getSheets()[0]
        const canvas = sheet_to_canvas(sheet)
        const rawData = canvas_to_bmp(canvas, doc.getPalette())
        const blob = new Blob([rawData.data], {type: 'image/bmp'})
        forceDownloadBlob(`${sheet.getPropValue('name')}.bmp`, blob)

    }
}

export const LoadFileAction:SimpleMenuAction = {
    type:"simple",
    title:'load',
    async perform (state:GlobalState ) {
        const input_element = document.createElement('input')
        input_element.setAttribute('type','file')
        input_element.style.display = 'none'
        document.body.appendChild(input_element)
        const new_doc = await new Promise((res,rej)=>{
            input_element.addEventListener('change',() => {
                console.log("user picked a file, we hope")
                const files = input_element.files
                if(!files || files.length <= 0) return
                const file = files[0]
                console.log(file)
                fileToJson(file).then(data => res(make_doc_from_json(data as object)))
            })
            input_element.click()
        })
        state.setPropValue('doc',new_doc as object)
    }
}
