import {Bounds, Point} from "josh_js_util"

export function strokeBounds(ctx: CanvasRenderingContext2D, bounds: Bounds, color: string, lineWidth: number) {
    ctx.strokeStyle = color
    ctx.lineWidth = lineWidth
    ctx.strokeRect(bounds.x, bounds.y, bounds.w, bounds.h)

}

export function fillBounds(ctx: CanvasRenderingContext2D, bounds: Bounds, color: string) {
    ctx.fillStyle = color
    ctx.fillRect(bounds.x, bounds.y, bounds.w, bounds.h)
}

function drawText(ctx: CanvasRenderingContext2D, s: string, point: Point, color: string) {
    ctx.fillStyle = color
    ctx.font = '3.5pt sans-serif'
    ctx.fillText(s, point.x, point.y + 5)
}

export function debugDrawText(ctx: CanvasRenderingContext2D, str: string, point: Point) {
    drawText(ctx, str, point, 'black')
    drawText(ctx, str, point.add(new Point(0.6, 0.6)), 'black')
    drawText(ctx, str, point.add(new Point(0.3, 0.3)), 'white')
}
