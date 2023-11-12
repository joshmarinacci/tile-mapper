import { ArrayGrid, Point } from "josh_js_util"
import React, { MouseEvent, useContext, useEffect, useRef, useState } from "react"

import { drawEditableSprite, ImagePalette } from "../common/common"
import { Icons } from "../common/icons"
import { ICON_CACHE } from "../iconcache"
import { DocContext } from "../model/contexts"
import { Tile } from "../model/tile"

export function TestMap(props: {
  tile: Tile | null
  mapArray: ArrayGrid<Tile>
  palette: ImagePalette
}) {
  const doc = useContext(DocContext)
  const tileSize = doc.getPropValue("tileSize")
  const { tile, mapArray } = props
  const ref = useRef<HTMLCanvasElement>(null)
  const [down, setDown] = useState<boolean>(false)
  const [grid, setGrid] = useState<boolean>(false)
  const [count, setCount] = useState(0)

  const scale = 4
  const redraw = () => {
    if (ref.current) {
      const canvas = ref.current
      const ctx = canvas.getContext("2d") as CanvasRenderingContext2D
      ctx.fillStyle = ctx.createPattern(
        ICON_CACHE.getIconCanvas(Icons.Checkerboard),
        "repeat",
      ) as CanvasPattern
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      mapArray.forEach((v, n) => {
        if (v) {
          ctx.save()
          ctx.translate(n.x * tileSize.w * scale, n.y * tileSize.h * scale)
          drawEditableSprite(ctx, scale, v, props.palette)
          if (grid) {
            ctx.strokeStyle = "gray"
            ctx.strokeRect(0, 0, tileSize.w * scale, tileSize.h * scale)
          }
          ctx.restore()
        }
      })
    }
  }
  useEffect(() => redraw(), [grid, count])

  useEffect(() => {
    redraw()
    const hand = () => redraw()
    tile?.onAny(hand)
    return () => tile?.offAny(hand)
  }, [tile])

  const canvasToImage = (e: MouseEvent<HTMLCanvasElement>) => {
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect()
    let pt = new Point(e.clientX, e.clientY)
      .subtract(new Point(rect.left, rect.top))
      .scale(1 / scale)
    pt = new Point(pt.x / tileSize.w, pt.y / tileSize.h).floor()
    return pt
  }
  return (
    <div style={{ overflow: "auto" }}>
      <div className={"toolbar"}>
        <button onClick={() => setGrid(!grid)}>grid</button>
      </div>
      <canvas
        ref={ref}
        width={32 * 10}
        height={32 * 10}
        onMouseDown={(e) => {
          setDown(true)
          if (tile) mapArray.set(canvasToImage(e), tile)
          setCount(count + 1)
          redraw()
        }}
        onMouseMove={(e) => {
          if (down) {
            if (tile) mapArray.set(canvasToImage(e), tile)
            redraw()
          }
        }}
        onMouseUp={() => setDown(false)}
      />
    </div>
  )
}
