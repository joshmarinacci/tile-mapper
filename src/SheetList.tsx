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
    setSheet: (s: EditableSheet) => void
}) {
    const {doc, sheet, setSheet} = props
    const add_sheet = () => {
        let sheet = new EditableSheet()
        doc.addSheet(sheet)
    }
    return <div className={'pane'}>
        <header>sheets</header>
        <div className={'toolbar'}>
            <button onClick={add_sheet}>add sheet</button>
        </div>
        <ListView selected={sheet}
                  setSelected={setSheet}
                  renderer={SheetNameRenderer}
                  data={doc.getSheets()}
                  style={{}}
                  className={'sheet-list'}/>
    </div>
}
