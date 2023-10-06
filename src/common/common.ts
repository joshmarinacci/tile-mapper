import bmp, {BitsPerPixel, IImage} from "@wokwi/bmp-ts"
import {ArrayGrid, Point} from "josh_js_util"

import {Sheet, Tile} from "../model/datamodel"

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
ArrayGrid.prototype.isValidIndex = function (pt: Point) {
    if (pt.x < 0) return false
    if (pt.y < 0) return false
    if (pt.x >= this.w) return false
    if (pt.y >= this.h) return false
    return true
}


export type ImagePalette = {
    name: string,
    colors: string[],
}
export const PICO8: ImagePalette = {
    name: 'PICO8',
    colors: [
        '#000000',
        '#1D2B53',
        '#7E2553',
        '#008751',
        '#AB5236',
        '#5F574F',
        '#C2C3C7',
        '#FFF1E8',
        '#FF004D',
        '#FFA300',
        '#FFEC27',
        '#00E436',
        '#29ADFF',
        '#83769C',
        '#FF77A8',
        '#FFCCAA',
        'transparent',
    ]
}
export const MINECRAFT: ImagePalette = {
    name: 'Minecraft', colors: [
        '#ffffff',
        '#999999',
        '#4c4c4c',
        '#191919',
        '#664c33',
        '#993333',
        '#d87f33',
        '#e5e533',
        '#7fcc19',
        '#667f33',
        '#4c7f99',
        '#6699d8',
        '#334cb2',
        '#7f3fb2',
        '#b24cd8',
        '#f27fa5',
    ]
}
export const RESURRECT64: ImagePalette = {
    name: 'Resurrect64',
    colors: [
        "#2e222f",
        "#3e3546",
        "#625565",
        "#966c6c",
        "#ab947a",
        "#694f62",
        "#7f708a",
        "#9babb2",
        "#c7dcd0",
        "#ffffff",
        "#6e2727",
        "#b33831",
        "#ea4f36",
        "#f57d4a",
        "#ae2334",
        "#e83b3b",
        "#fb6b1d",
        "#f79617",
        "#f9c22b",
        "#7a3045",
        "#9e4539",
        "#cd683d",
        "#e6904e",
        "#fbb954",
        "#4c3e24",
        "#676633",
        "#a2a947",
        "#d5e04b",
        "#fbff86",
        "#165a4c",
        "#239063",
        "#1ebc73",
        "#91db69",
        "#cddf6c",
        "#313638",
        "#374e4a",
        "#547e64",
        "#92a984",
        "#b2ba90",
        "#0b5e65",
        "#0b8a8f",
        "#0eaf9b",
        "#30e1b9",
        "#8ff8e2",
        "#323353",
        "#484a77",
        "#4d65b4",
        "#4d9be6",
        "#8fd3ff",
        "#45293f",
        "#6b3e75",
        "#905ea9",
        "#a884f3",
        "#eaaded",
        "#753c54",
        "#a24b6f",
        "#cf657f",
        "#ed8099",
        "#831c5d",
        "#c32454",
        "#f04f78",
        "#f68181",
        "#fca790",
        "#fdcbb0",
        'transparent',
    ]
}


export function drawEditableSprite(
    ctx: CanvasRenderingContext2D,
    scale: number,
    image: Tile,
    palette:ImagePalette) {
    for (let i = 0; i < image.width(); i++) {
        for (let j = 0; j < image.height(); j++) {
            const v: number = image.getPixel(new Point(i, j))
            ctx.fillStyle = palette.colors[v]
            ctx.fillRect(i * scale, j * scale, scale, scale)
        }
    }
}

export function sheet_to_canvas(sheet: Sheet) {
    const tiles = sheet.getPropValue('tiles') as Tile[]
    const sprite = tiles[0]
    const canvas = document.createElement('canvas')
    canvas.width = sprite.width() * tiles.length
    canvas.height = sprite.height()
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
    tiles.forEach((img, i) => {
        ctx.save()
        ctx.translate(i * sprite.width(), 0)
        drawEditableSprite(ctx, 1, img)
        ctx.restore()
    })
    return canvas
}

export function canvas_to_bmp(canvas: HTMLCanvasElement, palette1: string[]) {
    //get ImageData from the canvas
    const id = (canvas.getContext('2d') as CanvasRenderingContext2D).getImageData(0, 0, canvas.width, canvas.height)

    function swizzle_data(id: ImageData) {
        for (let i = 0; i < id.width; i++) {
            for (let j = 0; j < id.height; j++) {
                const n = (i + id.width * j) * 4

                const R = id.data[n + 0]
                const G = id.data[n + 1]
                const B = id.data[n + 2]
                // const A = id.data[n + 3]


                id.data[n + 0] = 255
                id.data[n + 1] = B
                id.data[n + 2] = G
                id.data[n + 3] = R
            }
        }
    }

    swizzle_data(id)

    function strToRGBObj(str: string) {
        const num = parseInt(str.substring(1), 16)
        const red = (num & 0xFF0000) >> 16
        const green = (num & 0x00FF00) >> 8
        const blue = (num & 0x0000FF) >> 0
        return {
            red: red,
            green: green,
            blue: blue,
            quad: 255,
        }
    }

    const palette = palette1.map(str => strToRGBObj(str))
    while (palette.length < 128) {
        palette.push({red: 0, green: 255, blue: 0, quad: 255})
    }

    const bmpData: IImage = {
        data: id.data as unknown as Uint8Array,
        bitPP: 8 as BitsPerPixel,
        width: canvas.width,
        height: canvas.height,
        palette: palette,
    }
    return bmp.encode(bmpData)
}

export const down_arrow_triangle = '▼'
export const up_arrow_triangle = '▲'
export const right_arrow_triangle = '▶'
export const left_arrow_triangle = '◀'

export enum Icons {
    DownArrow = 'down-arrow',
    UpArrow = 'up-arrow',
    LeftArrow = 'left-arrow',
    RightArrow = 'right-arrow',
    Plus = 'plus',
    Minus = 'minus',
    Trashcan = 'trashcan',
    Tile = 'tile',
    Resize = 'resize',
    EyeOpen = 'eye-open',
    EyeClosed = 'eye-closed',
    Checkerboard = 'checkerboard',
    PaintBucket = 'paint-bucket',
    Grid = 'grid',
    GridSelected = 'grid-selected',
    Actor = 'actor',
    Duplicate= 'duplicate',
    Gear = 'gear',
    Pencil = 'pencil',
    Eraser = 'eraser',
    Line = 'line',
    Rect = 'rect',
    RectSelected = 'rect-selected',
    Ellipse = 'ellipse',
    Selection = 'selection',
    SelectionSelected = 'selection-selected',
    Move = 'move',
    DividerHandle = 'divider-handle',
}

