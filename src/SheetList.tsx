import React from "react"

import {Doc2, Sheet2} from "./defs"
import {ListView, ListViewDirection, ListViewRenderer} from "./ListView"

const SheetNameRender:ListViewRenderer<Sheet2> = (props:{value:Sheet2, selected:boolean}) => {
    return <div>{props.value.getPropValue('name')}</div>
}
export function SheetList(props: {
    doc: Doc2,
    sheet: Sheet2,
    setSheet: (s: Sheet2) => void,
    editable: boolean
}) {
    const {doc, sheet, setSheet} = props
    const add_sheet = () => {
        // const sheet = new SheetModel()
        // doc.addSheet(sheet)
        // props.setSheet(sheet)
    }
    const delete_sheet = () => {
        // doc.removeSheet(props.sheet)
        // if(doc.getSheets().length > 0)  props.setSheet(doc.getSheets()[0])
    }
    return <div className={'pane sheet-list'}>
        <header>Sheets</header>
        {props.editable &&
        <div className={'toolbar'}>
            <button onClick={add_sheet}>add sheet</button>
            <button onClick={delete_sheet}>del sheet</button>
        </div>}
        <ListView selected={sheet}
                  setSelected={setSheet}
                  renderer={SheetNameRender}
                  data={doc.getPropValue('sheets')}
                  direction={ListViewDirection.VerticalFill}
                  style={{}}
                  className={'sheet-list'}/>
    </div>
}
