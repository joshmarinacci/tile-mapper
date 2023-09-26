import {Size} from "josh_js_util"

import {DefList, PropDef, PropsBase, PropValues} from "./base"
import {PICO8} from "./common"
import {GameDoc} from "./datamodel"

type GlobalStateType = {
    doc: GameDoc,
    mode: string,
    selection: PropsBase<unknown>,
    localStorage: Storage
}

const DocDef:PropDef<GameDoc> = {
    type:'string',
    hidden:false,
    expandable:false,
    format: () => "global state",
    toJSON: (o) => {
        return o.toString()
    },
    fromJSON: (v) => v as GameDoc,
    watchChildren:false,
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
    hidden: true,
    expandable: false,
    watchChildren: false,
    fromJSON: (v) => v as string
}
const SelectedDef:PropDef<unknown> = {
    type:'object',
    expandable:false,
    hidden:true,
    watchChildren: false,
    fromJSON: (v) => v,
    default: () => null,
    toJSON: () => 'unknown',
    editable:false,
    format: () => 'unknown',
}
const StateDef:DefList<GlobalStateType> = {
    doc:DocDef,
    mode: ModeDef,
    selection: SelectedDef,
    localStorage: {
        type: "object",
        expandable:false,
        hidden:true,
        default:() => null,
        editable: false,
        watchChildren:false,
    }
}
export class GlobalState extends PropsBase<GlobalStateType> {
    localStorage: Storage
    constructor(opts:PropValues<GlobalStateType>) {
        super(StateDef)
        if (typeof localStorage !== 'undefined') {
            this.localStorage = localStorage
        } else {
            this.localStorage = opts.localStorage as Storage
        }
    }
}
