import { Bounds, Point } from "josh_js_util";

export function strokeBounds(
  ctx: CanvasRenderingContext2D,
  bounds: Bounds,
  color: string,
  lineWidth: number,
) {
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.strokeRect(bounds.x, bounds.y, bounds.w, bounds.h);
}

export function fillBounds(
  ctx: CanvasRenderingContext2D,
  bounds: Bounds,
  color: string,
) {
  ctx.fillStyle = color;
  ctx.fillRect(bounds.x, bounds.y, bounds.w, bounds.h);
}
