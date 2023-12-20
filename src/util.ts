import { ArrayGrid, Bounds, Point, Size } from "josh_js_util"

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
