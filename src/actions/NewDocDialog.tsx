import { Size } from "josh_js_util"
import { DialogContext } from "josh_react_util"
import React, { useContext, useState } from "react"

import { ImagePalette, MINECRAFT, PICO8, RESURRECT64 } from "../common/common"
import { appendToList } from "../model/base"
import { GameDoc, Sheet, Tile } from "../model/datamodel"

function make_new_doc(width: number, height: number, palette: ImagePalette) {
  const TS = new Size(width, height)
  const doc = new GameDoc({
    name: "new doc",
    palette: palette,
    tileSize: TS,
  })
  const sheet = new Sheet({ tileSize: TS })
  const tile = new Tile({ size: TS })
  appendToList(sheet, "tiles", tile)
  appendToList(doc, "sheets", sheet)
  return doc
}
const PALS: ImagePalette[] = [PICO8, MINECRAFT, RESURRECT64]

export function NewDocDialog(props: { onComplete: (doc: GameDoc) => void }) {
  const [width, setWidth] = useState(16)
  const [height, setHeight] = useState(16)
  const [pal, setPal] = useState(PALS[0])
  const dc = useContext(DialogContext)
  const create = () => {
    const doc = make_new_doc(width, height, pal)
    props.onComplete(doc)
    dc.hide()
  }
  return (
    <div className={"dialog"}>
      <header>new document</header>
      <section className={"standard-form"}>
        <label>width</label>{" "}
        <input type={"number"} value={width} onChange={(e) => setWidth(parseInt(e.target.value))} />
        <label>height</label>{" "}
        <input
          type={"number"}
          value={height}
          onChange={(e) => setHeight(parseInt(e.target.value))}
        />
        <label>palette</label>
        <select
          value={pal.name}
          onChange={(e) => {
            const pp = PALS.find((p) => p.name === e.target.value) as ImagePalette
            setPal(pp)
          }}
        >
          {PALS.map((pal) => {
            return (
              <option key={pal.name} value={pal.name}>
                {pal.name}
              </option>
            )
          })}
        </select>
      </section>
      <footer>
        <button onClick={() => dc.hide()}>cancel</button>
        <button className={"primary"} onClick={create}>
          create
        </button>
      </footer>
    </div>
  )
}
