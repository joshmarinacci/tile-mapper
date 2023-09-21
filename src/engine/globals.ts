import {Bounds, Point, Size} from "josh_js_util";
import {TileCache} from "./cache";

type TileName = string
export type TileReference = {
    uuid: TileName
}

export interface Layer {
    name: string,
    type: 'tilemap' | 'actors' | 'overlay'
    blocking: boolean
    drawSelf(ctx: CanvasRenderingContext2D, viewport: Bounds, cache:TileCache): void
}

export const TILE_SIZE = 16
export const SCALE = 4
export const CANVAS_SIZE = new Size(12*SCALE*TILE_SIZE, 10*SCALE*TILE_SIZE)
export const GRAVITY = 0.2
export const JUMP_POWER = -6
export const MAX_MOVE = 1.5;
export const EPISLON = 0.001;
export const MOVE_SPEED = 0.3
export const FRICTION = 0.90;

export type Actor = {
    type: string
    bounds: Bounds,
    color: string,
    hidden: boolean,
    tile: TileReference,
}
export type Player = {
    hitable: boolean
    name:string,
    type: 'player'
    vx: number,
    vy: number
    standing: boolean,
} & Actor
export type Enemy = {
    name:string,
    type: 'enemy',
    vx: number,
} & Actor
export type Item = {
    name:string,
    type:'item'
} & Actor
export type Tile = {
    srcBounds: Bounds,
    blocking: boolean,
    name: string,
}
