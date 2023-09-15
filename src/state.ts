import {PropsBase} from "./base"
import {DocModel, SheetModel, SpriteModel} from "./defs"
import {PICO8} from "./model"

type GlobalStateType = {
    doc: object,
    mode: string,
}

export class GlobalState extends PropsBase<GlobalStateType> {
    constructor() {
        super()
        this.setPropDef('doc', {
            type: 'object',
            format: (o) => "global state",
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
        })
        this.setPropDef('mode', {
            type: 'string',
            default: () => 'tiles',
            toJSON: (o) => o,
            editable: false,
            format: (o) => o,
        })
        this.setPropValue('doc', this.getPropDef('doc').default())
        this.setPropValue('mode', this.getPropDef('mode').default())
    }
}
