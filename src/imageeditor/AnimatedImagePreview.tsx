import { Spacer } from "josh_react_util"
import React, { useContext, useEffect, useRef, useState } from "react"

import { IconButton } from "../common/common-components"
import { Icons } from "../common/icons"
import { useWatchAllProps } from "../model/base"
import { DocContext } from "../model/contexts"
import { SImage } from "../model/image"
import { drawImage } from "./drawing"

export function AnimatedImagePreview(props: { image: SImage; count: number }) {
  const { image, count } = props
  const ref = useRef(null)
  const size = image.size()
  const [scale, setScale] = useState(3)
  const [frame, setFrame] = useState(0)
  const doc = useContext(DocContext)

  function redraw() {
    if (ref.current) {
      const canvas = ref.current as HTMLCanvasElement
      const ctx = canvas.getContext("2d") as CanvasRenderingContext2D
      ctx.fillStyle = "white"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      const frame = props.image.frames()[0]
      drawImage(doc, ctx, props.image, doc.getPropValue("palette"), scale, frame)
    }
  }

  useEffect(() => redraw(), [scale, count, frame])
  const cycle = () => {
    // const fc = image.getPropValue("frameCount")
    // setFrame((frame + 1) % fc)
  }

  useWatchAllProps(image, () => redraw())
  return (
    <div className={"image-editor-preview"}>
      <header>
        <IconButton onClick={() => setScale(scale + 1)} icon={Icons.Plus} />
        <IconButton onClick={() => setScale(scale - 1)} icon={Icons.Minus} />
        <IconButton onClick={() => cycle()} icon={Icons.Play} />
        <Spacer />
        <label>title bar</label>
      </header>
      <canvas ref={ref} width={size.w * scale} height={size.h * scale}></canvas>
    </div>
  )
}
