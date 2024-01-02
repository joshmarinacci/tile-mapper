import { ArrayGrid, Bounds, Point, Size } from "josh_js_util"
import { ConsoleInterface } from "retrogami-engine/dist/scripting"

import { ArrayGridNumberJSON } from "./model/datamodel"

export function strokeBounds(
  ctx: CanvasRenderingContext2D,
  bounds: Bounds,
  color: string,
  lineWidth: number,
) {
  ctx.strokeStyle = color
  ctx.lineWidth = lineWidth
  ctx.strokeRect(bounds.x, bounds.y, bounds.w, bounds.h)
}

export function fillBounds(ctx: CanvasRenderingContext2D, bounds: Bounds, color: string) {
  ctx.fillStyle = color
  ctx.fillRect(bounds.x, bounds.y, bounds.w, bounds.h)
}
export function drawTextWithBackground(
  ctx: CanvasRenderingContext2D,
  text: string,
  pos: Point,
  textColor: string,
  backgroundColor: string,
) {
  ctx.font = "bold 10px sans-serif"
  const metrics = ctx.measureText(text)
  const size = new Size(
    metrics.width,
    metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent,
  )
  const bds = Bounds.fromPointSize(pos.subtract(new Point(0, size.h)), size)
  fillBounds(ctx, bds.grow(5), backgroundColor)
  ctx.fillStyle = textColor
  ctx.fillText(text, bds.x, bds.y + metrics.fontBoundingBoxAscent)
}

export function fillOutsideBounds(
  ctx: CanvasRenderingContext2D,
  bounds: Bounds,
  color: string,
  outside: Size,
) {
  ctx.fillStyle = color
  const b = bounds
  const s = outside
  ctx.fillRect(0, 0, b.left(), s.h)
  ctx.fillRect(b.right(), 0, s.w - b.right(), s.h)
  ctx.fillRect(0, b.bottom(), s.w, s.h - b.bottom())
}

export function cloneArrayGrid<T>(data: ArrayGrid<T>): ArrayGrid<T> {
  const d2 = new ArrayGrid<T>(data.w, data.h)
  d2.fill((n) => data.get(n))
  return d2
}

export function wrapNumber(value: number, min: number, max: number): number {
  if (value < min) {
    return (value + (max - min)) % max
  }
  if (value >= max) {
    return value % max
  }
  return value
}
export function wrapPoint(point: Point, size: Size): Point {
  const pt = point.copy()
  if (point.x >= size.w) {
    pt.x = point.x % size.w
  }
  if (point.x < 0) {
    pt.x = (point.x + size.w) % size.w
  }
  if (point.y >= size.h) {
    pt.y = point.y % size.h
  }
  if (point.y < 0) {
    pt.y = (point.y + size.h) % size.h
  }
  return pt
}

export function clamp(val: number, min: number, max: number) {
  if (val < min) return min
  if (val > max) return max
  return val
}
export function ArrayGridToJson(ag: ArrayGrid<number>): ArrayGridNumberJSON {
  return { w: ag.w, h: ag.h, data: ag.data }
}
export function JSONToArrayGrid(json: ArrayGridNumberJSON): ArrayGrid<number> {
  const arr = new ArrayGrid<number>(json.w, json.h)
  arr.data = json.data
  return arr
}

export type Callback = () => void

export class Observable {
  listeners: Map<string, Callback[]>
  values: Record<string, any>

  constructor() {
    this.listeners = new Map()
    this.values = {}
  }

  on(name: string, cb: Callback) {
    if (!this.listeners.has(name)) {
      this.listeners.set(name, [])
    }
    this.listeners.get(name)?.push(cb)
  }

  off(name: string, cb: Callback) {
    const listeners = this.listeners.get(name) as Callback[]
    this.listeners.set(
      name,
      listeners.filter((c) => c !== cb),
    )
  }
  fire(name: string) {
    this.listeners.get(name)?.forEach((cb) => cb())
  }

  getProperty(property: string) {
    return this.values[property]
  }

  setProperty(property: string, b: unknown) {
    this.values[property] = b
    this.fire(property)
  }
}

export class ConsoleLogger implements ConsoleInterface {
  log(...args: unknown[]): void {
    console.log("OUTPUT", ...args)
  }
}
