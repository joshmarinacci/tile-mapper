import React from "react"

import {DocModel, SheetModel} from "./defs"
import {ListView, ListViewRenderer} from "./ListView"

const SheetNameRender:ListViewRenderer<SheetModel> = (props:{value:SheetModel, selected:boolean}) => {
    return <div>{props.value.getPropValue('name')}</div>
}
export function SheetList(props: {
    doc: DocModel,
    sheet: SheetModel,
    setSheet: (s: SheetModel) => void,
    editable: boolean
}) {
    const {doc, sheet, setSheet} = props
    const add_sheet = () => {
        const sheet = new SheetModel()
        doc.addSheet(sheet)
        props.setSheet(sheet)
    }
    const delete_sheet = () => {
        doc.removeSheet(props.sheet)
        if(doc.getSheets().length > 0)  props.setSheet(doc.getSheets()[0])
    }
    return <div className={'pane'}>
        <header>sheets</header>
        {props.editable &&
        <div className={'toolbar'}>
            <button onClick={add_sheet}>add sheet</button>
            <button onClick={delete_sheet}>del sheet</button>
        </div>}
        <ListView selected={sheet}
                  setSelected={setSheet}
                  renderer={SheetNameRender}
                  data={doc.getSheets()}
                  style={{}}
                  className={'sheet-list'}/>
    </div>
}
