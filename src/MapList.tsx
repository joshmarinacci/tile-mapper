import {EditableDocument, EditableSheet, EditableSprite} from "./common";

export function MapList(props:{
    doc: EditableDocument,
    map: EditableSheet,
    setMap: (s: EditableSheet) => void
}) {
    return         <div className={'pane'}>
        <header>maps</header>
    </div>
}

export function MapProps(props: {
    doc: EditableDocument,
    map: EditableSheet,
}) {
    return  <div className={'pane'}>
        <header>map props</header>
    </div>
}

export function MapEditor(props:{
    map:EditableSheet,
    sheet:EditableSheet,
    tile:EditableSprite,
}) {
    return <div>map editor</div>
}
