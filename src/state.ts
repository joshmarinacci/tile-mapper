import {PropDef, PropsBase} from "./base"
import {DocModel, SheetModel, SpriteModel} from "./defs"
import {PICO8} from "./model"

type GlobalStateType = {
    doc: DocModel,
    mode: string,
    selection: object,
}

const DocDef:PropDef<DocModel> = {
    type:'string',
    format: () => "global state",
    toJSON: (o) => {
        return o.toString()
    },
    editable: false,
    default: () => {
        const doc = new DocModel()
        doc.setPalette(PICO8)
        const sheet = new SheetModel()
        const img = new SpriteModel(10, 10, PICO8)
        const img2 = new SpriteModel(10, 10, PICO8)
        sheet.addSprite(img)
        sheet.addSprite(img2)
        doc.addSheet(sheet)
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
