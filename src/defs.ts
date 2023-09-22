import {Bounds, Point, Size} from "josh_js_util"

import {PropDef} from "./base"
import {
    ImagePalette,
    PICO8
} from "./model"

export const NameDef: PropDef<string> = {
    type: 'string',
    editable: true,
    default: () => 'unnamed',
    toJSON: (v: string) => v,
    format: (v) => v,
}
export const SizeDef: PropDef<Size> = {
    type:'Size',
    editable:false,
    default: () => new Size(10,10),
    toJSON: (v) => v.toJSON(),
    fromJSON: (v) => Size.fromJSON(v),
    format: (v) => `${v.w} x ${v.h}`,
}
export const PointDef: PropDef<Point> = {
    type:'Point',
    editable:false,
    default: () => new Point(0,0),
    toJSON: (v) => v.toJSON(),
    fromJSON: (v) => Point.fromJSON(v),
    format: (v) => `${v.x} , ${v.y}`,
}
export const BoundsDef: PropDef<Bounds> = {
    type:'Bounds',
    editable:false,
    default: () => new Bounds(0,0,10,10),
    toJSON: (v) => v.toJSON(),
    format: (v) => `${v.w} x ${v.h}`,
    fromJSON: (v) => Bounds.fromJSON(v)
}
export const PaletteDef: PropDef<ImagePalette> = {
    type:'object',
    editable:false,
    default: () => PICO8,
    toJSON: (v) => PICO8,
    format: (v) => 'unknown',
    fromJSON: (v) => v,
}

const JumpDef: PropDef<number> = {
    type: 'float',
    editable: true,
    default: () => 0.0,
    toJSON: (v: number) => v,
    format: (v) => v.toFixed(2),
}
const ViewportDef: PropDef<Size> = {
    type: 'Size',
    editable: true,
    default: () => new Size(10, 10),
    toJSON: (v: Size) => v.toJSON(),
    format: (v) => `${v.w} x ${v.h}`,
}
const GravityDef: PropDef<Point> = {
    type: 'Point',
    editable: true,
    default: () => new Point(0, 0.1),
    toJSON: (v: Point) => v.toJSON(),
    format: (v) => `${v.x} , ${v.y}`,
}
const MoveSpeedDef: PropDef<number> = {
    type: 'float',
    editable: true,
    default: () => 0.5,
    toJSON: (v: number) => v,
    format: (v) => v.toFixed(2),
}
const MaxFallSpeedDef: PropDef<number> = {
    type: 'float',
    editable: true,
    default: () => 0.5,
    toJSON: (v: number) => v,
    format: (v) => v.toFixed(2),
}
const FrictionDef:PropDef<number> = {
    type:"float",
    default: () => 0.99,
    editable:true,
    toJSON: (v) => v,
    format: (v) => v.toFixed(2),
}
const CURRENT_VERSION = 4
export type MapCell = {
    tile: string, //id of the sprite used to draw this
}

export const BlockingDef:PropDef<boolean> = {
    type:"boolean",
    editable:true,
    default: () => false,
    toJSON: (v) => v,
    format: (v) => v?'true':'false',
}



