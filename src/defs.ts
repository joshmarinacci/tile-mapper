import {ArrayGrid, genId, Point, Size} from "josh_js_util"

import {PropDef, PropsBase, UUID} from "./base"
import {EditableMapCell} from "./model"

const NameDef: PropDef<string> = {
    type: 'string',
    editable: true,
    default: () => 'new test',
    toJSON: (v: string) => v,
}
const JumpDef: PropDef<number> = {
    type: 'float',
    editable: true,
    default: () => 0.0,
    toJSON: (v: number) => v,
}
const ViewportDef: PropDef<Size> = {
    type: 'Size',
    editable: true,
    default: () => new Size(10, 10),
    toJSON: (v: Size) => v.toJSON(),
}
const GravityDef: PropDef<Point> = {
    type: 'Point',
    editable: true,
    default: () => new Point(0, 0.1),
    toJSON: (v: Point) => v.toJSON(),
}
const MoveSpeedDef: PropDef<number> = {
    type: 'float',
    editable: true,
    default: () => 0.5,
    toJSON: (v: number) => v,
}
const MaxFallSpeedDef: PropDef<number> = {
    type: 'float',
    editable: true,
    default: () => 0.5,
    toJSON: (v: number) => v,
}

const FrictionDef:PropDef<number> = {
    type:"float",
    default: () => 0.99,
    editable:true,
    toJSON: (v) => v
}
type TestType = {
    name: string,
    viewport: Size,
    jump_power: number,
    gravity: Point,
    move_speed: number,
    max_fall_speed: number,
    friction: number,
}

export class TestImpl extends PropsBase<TestType> {
    constructor() {
        super()
        this.setPropDef("name", NameDef)
        this.setPropDef('viewport', ViewportDef)
        this.setPropDef('jump_power', JumpDef)
        this.setPropDef('gravity', GravityDef)
        this.setPropDef('move_speed', MoveSpeedDef)
        this.setPropDef('max_fall_speed', MaxFallSpeedDef)
        this.setPropDef('friction', FrictionDef)
        for(const [name, def] of this.getAllPropDefs()) {
            this.setPropValue(name,def.default())
        }
    }

    static make(): TestImpl {
        return new TestImpl()
    }

    static fromJSON(json: object): TestImpl {
        console.log("loading from json", json)
        if (!json) throw new Error("null json obj")
        const test = TestImpl.make()
        if ('id' in json) test._id = json.id as UUID
        if ('name' in json) test._values.set('name', json.name)
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if ('viewport' in json) test._values.set('viewport', Size.fromJSON(json.viewport))
        return test
    }

}

type MapType = {
    name:string,
    size:Size
}

export class MapImpl extends PropsBase<MapType> {
    cells: ArrayGrid<EditableMapCell>

    constructor() {
        super()
        this.setPropDef("name", {
            type:'string',
            editable:true,
            default:()=>'new map',
            toJSON:(v) => v
        })
        this.setPropDef('size',{
            type:'Size',
            editable:false,
            default:()=>new Size(10,10),
            toJSON:(v:Size) => v.toJSON()
        })
        for(const [name, def] of this.getAllPropDefs()) {
            this.setPropValue(name,def.default())
        }
        const size = this.getPropValue('size')
        this.cells = new ArrayGrid<EditableMapCell>(size.w, size.h)
        this.cells.fill(() => ({tile: "nothin"}))
    }

    static make(): MapImpl {
        return new MapImpl()
    }

    static fromJSON(json: object): MapImpl {
        console.log("MapImpl.fromJSON", json)
        const map = MapImpl.make()
        if ('id' in json) map._id = json.id as UUID
        if ('name' in json) map.setPropValue('name', json.name)
        const size = new Size(json.width, json.height)
        map.setPropValue('size', size)
        map.cells = new ArrayGrid<EditableMapCell>(size.w, size.h)
        map.cells.set_from_list(json.cells)
        return map
    }
}
