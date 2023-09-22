import React from "react"

import {GameDoc, Sheet} from "./datamodel"
import {ListView, ListViewDirection, ListViewRenderer} from "./ListView"

const SheetNameRender:ListViewRenderer<Sheet> = (props:{value:Sheet, selected:boolean}) => {
    return <div className={'std-list-item'}>{props.value.getPropValue('name')}</div>
}
export function SheetList(props: {
    doc: GameDoc,
    sheet: Sheet,
    setSheet: (s: Sheet) => void,
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
