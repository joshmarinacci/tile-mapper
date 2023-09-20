import {PropDef, PropsBase} from "./base"
import {Doc2} from "./data2"
import {SheetModel, SpriteModel} from "./defs"
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
        const doc = new Doc2()
        const sheet = new SheetModel()
        const img = new SpriteModel(10, 10, PICO8)
        const img2 = new SpriteModel(10, 10, PICO8)
        sheet.addSprite(img)
        sheet.addSprite(img2)
        // doc.addSheet(sheet)
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
