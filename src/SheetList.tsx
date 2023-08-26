import {EditableDocument, EditableSheet} from "./common";
import {ListView} from "./ListView";
import React from "react";

function SheetNameRenderer(props: {
    value: EditableSheet,
    selected: any,
    setSelected: (value: any) => void
}) {
    return <div onClick={() => props.setSelected(props.value)}>
        {props.value.getName()}
    </div>
}

export function SheetList(props: {
    doc: EditableDocument,
    sheet: EditableSheet,
    setSheet: (s: EditableSheet) => void,
    editable: boolean
}) {
    const {doc, sheet, setSheet} = props
    const add_sheet = () => {
        let sheet = new EditableSheet()
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
                  renderer={SheetNameRenderer}
                  data={doc.getSheets()}
                  style={{}}
                  className={'sheet-list'}/>
    </div>
}
