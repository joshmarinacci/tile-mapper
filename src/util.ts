import { ArrayGrid, Bounds, Size } from "josh_js_util"

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
