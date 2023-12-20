import React, { useEffect, useRef } from "react"

import { ImagePalette } from "../common/common"
import { ListViewRenderer } from "../common/ListView"
import { useWatchProp } from "../model/base"
import { GameDoc } from "../model/gamedoc"
import { ImageFrame, SImage } from "../model/image"
import { drawImage } from "./ImageEditorView"

type FrameItemRendererOptions = {
  image: SImage
  doc: GameDoc
  palette: ImagePalette
}

function FrameView(props: {
  image: SImage
  scale: number
  frame: ImageFrame
  doc: GameDoc
  palette: ImagePalette
}) {
  const { image, scale, frame, doc, palette } = props
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const size = image.getPropValue("size").scale(scale)
  const redraw = () => {
    if (canvasRef.current && frame && image) {
      const ctx = canvasRef.current.getContext("2d") as CanvasRenderingContext2D
      drawImage(doc, ctx, image, palette, scale, frame)
    }
  }
  useWatchProp(image, "history", () => redraw())
  useEffect(() => redraw(), [])
  return <canvas ref={canvasRef} width={size.w} height={size.h}></canvas>
}

export const FrameItemRenderer: ListViewRenderer<ImageFrame, FrameItemRendererOptions> = (props: {
  value: ImageFrame | undefined
  selected: boolean
  options: FrameItemRendererOptions
}) => {
  const { value } = props
  if (!value) return <div className={"std-list-item"}>missing layer</div>
  const name = value.getPropValue("name")
  const group = value.getPropValue("group")
  useWatchProp(value, "name")
  useWatchProp(value, "group")
  useWatchProp(value, "duration")
  return (
    <div className={"frame-view-item"} style={{ justifyContent: "space-between" }}>
      <FrameView
        frame={value}
        image={props.options.image}
        scale={4}
        doc={props.options.doc}
        palette={props.options.palette}
      />
      {/*<b>{name}</b>*/}
      {/*<i>{group}</i>*/}
    </div>
  )
}
