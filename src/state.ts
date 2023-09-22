import {Size} from "josh_js_util"

import {PropDef, PropsBase} from "./base"
import {PICO8} from "./common"
import {Doc2} from "./datamodel"

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
        return new Doc2({tileSize: size, name: 'unnamed doc', palette: PICO8})
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
