import { Bounds, Point, Size } from "josh_js_util"
import React, { useContext, useEffect, useRef } from "react"

import { ImageSnapshotContext } from "../model/contexts"
import { SImage } from "../model/image"
import { fillBounds } from "../util"

export function ImageSnapshotView(props: { image: SImage | undefined; scale: number }) {
  const { image, scale } = props
  const ref = useRef<HTMLCanvasElement>(null)
  const isc = useContext(ImageSnapshotContext)
  const size = image ? image.getPropValue("size").scale(scale) : new Size(16, 16)
  const redraw = () => {
    if (ref.current) {
      const ctx = ref.current.getContext("2d") as CanvasRenderingContext2D
      ctx.imageSmoothingEnabled = false
      if (image) {
        const snap = isc.getSnapshotCanvas(image.getUUID())
        ctx.drawImage(snap, 0, 0, snap.width * scale, snap.height * scale)
      } else {
        ctx.fillStyle = "magenta"
        fillBounds(ctx, Bounds.fromPointSize(new Point(0, 0), size), "magenta")
      }
    }
  }
  useEffect(() => {
    if (image) {
      const hand = (can: HTMLCanvasElement) => redraw()
      isc.onChange(image.getUUID(), hand)
      redraw()
      return () => isc.offChange(image.getUUID(), hand)
    }
  }, [image])
  return <canvas ref={ref} width={`${size.w}px`} height={`${size.h}px`} />
}
