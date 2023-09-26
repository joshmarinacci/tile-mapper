import {Size} from "josh_js_util"

import {DefList, PropDef, PropsBase} from "./base"
import {PICO8} from "./common"
import {GameDoc} from "./datamodel"

type GlobalStateType = {
    doc: GameDoc,
    mode: string,
    selection: PropsBase<unknown>,
}

const DocDef:PropDef<GameDoc> = {
    type:'string',
    format: () => "global state",
    toJSON: (o) => {
        return o.toString()
    },
    editable: false,
    default: () => {
        const size = new Size(10,10)
        return new GameDoc({tileSize: size, name: 'unnamed doc', palette: PICO8})
    }
}
const ModeDef:PropDef<string> = {
    type: 'string',
    default: () => 'tiles',
    toJSON: (o) => o,
    editable: false,
    format: (o) => o,
}
const SelectedDef:PropDef<unknown> = {
    type:'object',
    default: () => null,
    toJSON: () => 'unknown',
    editable:false,
    format: () => 'unknown',
}
const StateDef:DefList<GlobalStateType> = {
    doc:DocDef,
    mode: ModeDef,
    selection: SelectedDef,
}
export class GlobalState extends PropsBase<GlobalStateType> {
    constructor() {
        super(StateDef)
    }
}
