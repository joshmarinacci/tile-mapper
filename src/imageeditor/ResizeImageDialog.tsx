import { Size } from "josh_js_util"
import { DialogContext } from "josh_react_util"
import React, { useContext, useState } from "react"

import { SImage } from "../model/image"

export function ResizeImageDialog(props: { image: SImage }) {
  const { image } = props
  const size = image.getPropValue("size")
  const [width, setWidth] = useState(size.w)
  const [height, setHeight] = useState(size.h)
  const dm = useContext(DialogContext)
  const cancel = () => {
    dm.hide()
  }
  const resize = () => {
    image.resize(new Size(width, height))
    dm.hide()
  }
  return (
    <div className={"dialog"}>
      <header>resize image</header>
      <section className={"standard-form"}>
        <label>new width</label>
        <input type={"number"} value={width} onChange={(e) => setWidth(parseInt(e.target.value))} />
        <label>new height</label>
        <input
          type={"number"}
          value={height}
          onChange={(e) => setHeight(parseInt(e.target.value))}
        />
      </section>
      <footer>
        <button onClick={cancel}>cancel</button>
        <button onClick={resize}>resize</button>
      </footer>
    </div>
  )
}
