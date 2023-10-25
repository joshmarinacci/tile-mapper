import { Size } from "josh_js_util"
import { DialogContext } from "josh_react_util"
import React, { useContext, useState } from "react"

export function AddImageDialog(props: { onComplete: (size: Size) => void }) {
  const dm = useContext(DialogContext)
  const [width, setWidth] = useState(16)
  const [height, setHeight] = useState(16)
  return (
    <div className={"dialog"}>
      <header>create new drawing canvas</header>
      <section className={"standard-form"}>
        <label>width</label>{" "}
        <input type={"number"} value={width} onChange={(e) => setWidth(parseInt(e.target.value))} />
        <label>height</label>{" "}
        <input
          type={"number"}
          value={height}
          onChange={(e) => setHeight(parseInt(e.target.value))}
        />
      </section>
      <footer>
        <button
          onClick={() => {
            dm.hide()
          }}
        >
          cancel
        </button>
        <button
          onClick={() => {
            dm.hide()
            props.onComplete(new Size(width, height))
          }}
        >
          create
        </button>
      </footer>
    </div>
  )
}
