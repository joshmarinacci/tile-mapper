import React, { useContext, useEffect, useRef } from "react"

import { calculate_context_actions } from "../actions/actions"
import { ImagePalette } from "../common/common"
import { MenuList, ToolbarActionButton } from "../common/common-components"
import { ListViewRenderer } from "../common/ListView"
import { PopupContext } from "../common/popup"
import { useWatchProp } from "../model/base"
import { GameDoc } from "../model/gamedoc"
import { ImageFrame, SImage } from "../model/image"
import { drawImage } from "./drawing"

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
  const pm = useContext(PopupContext)
  const showContextMenu = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault()
    // select(e)
    const actions = calculate_context_actions(frame)
    const items = actions.map((act) => <ToolbarActionButton action={act} />)
    pm.show_at(<MenuList>{items}</MenuList>, e.target, "right")
  }

  const redraw = () => {
    if (canvasRef.current && frame && image) {
      const ctx = canvasRef.current.getContext("2d") as CanvasRenderingContext2D
      drawImage(doc, ctx, image, palette, scale, frame)
    }
  }
  useWatchProp(image, "history", () => redraw())
  useEffect(() => redraw(), [])
  return (
    <canvas ref={canvasRef} width={size.w} height={size.h} onContextMenu={showContextMenu}></canvas>
  )
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
      <b>{name}</b>
      <i>{group}</i>
    </div>
  )
}
