import bmp, { BitsPerPixel, IImage } from "@wokwi/bmp-ts"
import { Point } from "josh_js_util"

import { FramePixelSurface, ImageLayer, SImage } from "../model/image"
import { Sheet } from "../model/sheet"
import { Tile } from "../model/tile"
import { clamp } from "../util"

export type ImagePalette = {
  name: string
  colors: string[]
  url?: string
}
export const PICO8: ImagePalette = {
  name: "PICO8",
  colors: [
    "#000000",
    "#1D2B53",
    "#7E2553",
    "#008751",
    "#AB5236",
    "#5F574F",
    "#C2C3C7",
    "#FFF1E8",
    "#FF004D",
    "#FFA300",
    "#FFEC27",
    "#00E436",
    "#29ADFF",
    "#83769C",
    "#FF77A8",
    "#FFCCAA",
    "transparent",
  ],
}
export const MINECRAFT: ImagePalette = {
  name: "Minecraft",
  colors: [
    "#ffffff",
    "#999999",
    "#4c4c4c",
    "#191919",
    "#664c33",
    "#993333",
    "#d87f33",
    "#e5e533",
    "#7fcc19",
    "#667f33",
    "#4c7f99",
    "#6699d8",
    "#334cb2",
    "#7f3fb2",
    "#b24cd8",
    "#f27fa5",
  ],
}
export const RESURRECT64: ImagePalette = {
  name: "Resurrect64",
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
    "transparent",
  ],
}
export const ICECREAM_GB: ImagePalette = {
  name: "ICE CREAM GB",
  url: "https://lospec.com/palette-list/ice-cream-gb",
  colors: ["#7c3f58", "#eb6b6f", "#f9a875", "#fff6d3"],
}
export const GAMEBOY: ImagePalette = {
  name: "GAMEBOY",
  url: "https://lospec.com/palette-list/nintendo-gameboy-bgb",
  colors: ["#081820", "#346856", "#88c070", "#e0f8d0"],
}

function drawPixelLayer(
  ctx: CanvasRenderingContext2D,
  layer: ImageLayer,
  surf: FramePixelSurface,
  palette: ImagePalette,
  scale: number,
) {
  ctx.save()
  ctx.globalAlpha = clamp(layer.opacity(), 0, 1)
  surf.forEach((n: number, p: Point) => {
    ctx.fillStyle = palette.colors[n]
    if (n === -1) ctx.fillStyle = "transparent"
    ctx.fillRect(p.x * scale, p.y * scale, 1 * scale, 1 * scale)
  })
  ctx.restore()
}

export function drawEditableSprite(
  ctx: CanvasRenderingContext2D,
  scale: number,
  tile: Tile,
  palette: ImagePalette,
) {
  const image: SImage = tile.getPropValue("data")
  const frame = image.frames()[0]
  image.layers().forEach((layer) => {
    if (!layer.visible()) return
    const surf = image.getPixelSurface(layer, frame)
    drawPixelLayer(ctx, layer, surf, palette, scale)
  })
}

export function sheet_to_canvas(sheet: Sheet, palette: ImagePalette): HTMLCanvasElement {
  const tiles = sheet.getPropValue("tiles") as Tile[]
  const sprite = tiles[0]
  const canvas = document.createElement("canvas")
  canvas.width = sprite.width() * tiles.length
  canvas.height = sprite.height()
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D
  tiles.forEach((img, i) => {
    ctx.save()
    ctx.translate(i * sprite.width(), 0)
    drawEditableSprite(ctx, 1, img, palette)
    ctx.restore()
  })
  return canvas
}

export function canvas_to_bmp(canvas: HTMLCanvasElement, pal: ImagePalette) {
  //get ImageData from the canvas
  const id = (canvas.getContext("2d") as CanvasRenderingContext2D).getImageData(
    0,
    0,
    canvas.width,
    canvas.height,
  )

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
    const red = (num & 0xff0000) >> 16
    const green = (num & 0x00ff00) >> 8
    const blue = (num & 0x0000ff) >> 0
    return {
      red: red,
      green: green,
      blue: blue,
      quad: 255,
    }
  }

  const palette = pal.colors.map((str) => strToRGBObj(str))
  while (palette.length < 128) {
    palette.push({ red: 0, green: 255, blue: 0, quad: 255 })
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

export const down_arrow_triangle = "▼"
export const up_arrow_triangle = "▲"
export const right_arrow_triangle = "▶"
export const left_arrow_triangle = "◀"
