import {Size} from "josh_js_util"

import { PropDef, PropsBase} from "./base"
import {Doc2} from "./data2"
import {PICO8} from "./model"

type GlobalStateType = {
    doc: Doc2,
    mode: string,
    selection: PropsBase<any>,
}

const DocDef:PropDef<Doc2> = {
    type:'string',
    format: () => "global state",
    toJSON: (o) => {
        return o.toString()
    },
    editable: false,
    default: () => {
        const size = new Size(10,10)
        const doc = new Doc2({tileSize: size, name:'unnamed doc', palette:PICO8})
        return doc
    }
}
const ModeDef:PropDef<string> = {
    type: 'string',
    default: () => 'tiles',
    toJSON: (o) => o,
    editable: false,
    format: (o) => o,
}
const SelectedDef:PropDef<object> = {
    type:'object',
    default: () => null,
    toJSON: (o) => 'uknown',
    editable:false,
    format: (o) => 'unknown',
}
export class GlobalState extends PropsBase<GlobalStateType> {
    constructor() {
        super({
            doc:DocDef,
            mode: ModeDef,
            selected: SelectedDef,
        })
    }
}
