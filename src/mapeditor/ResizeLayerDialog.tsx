import { ArrayGrid, Size } from "josh_js_util"
import { DialogContext } from "josh_react_util"
import React, { useContext, useState } from "react"

import { MapCell, TileLayer } from "../model/datamodel"

enum ArrayGridResizeAlignment {
  UPPER_LEFT,
  CENTER,
}

function resizeArrayGrid(
  data: ArrayGrid<MapCell>,
  size: Size,
  alignment: ArrayGridResizeAlignment,
  empty: MapCell,
): ArrayGrid<MapCell> {
  const d2 = ArrayGrid.fromSize<MapCell>(size)
  d2.fill((n) => {
    if (data.isValidIndex(n)) return data.get(n)
    return empty
  })
  return d2
}

export function ResizeLayerDialog(props: { layer: TileLayer }) {
  const [width, setWidth] = useState(props.layer.getPropValue("size").w)
  const [height, setHeight] = useState(props.layer.getPropValue("size").h)
  const dc = useContext(DialogContext)
  const doResize = () => {
    const size = new Size(width, height)
    const data = props.layer.getPropValue("data")
    const data2: ArrayGrid<MapCell> = resizeArrayGrid(
      data,
      size,
      ArrayGridResizeAlignment.UPPER_LEFT,
      { tile: "unknown" } as MapCell,
    )
    props.layer.setPropValue("data", data2)
    props.layer.setPropValue("size", size)
    dc.hide()
  }
  return (
    <div className={"dialog"}>
      <header>resize layer</header>
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
        <button onClick={() => dc.hide()}>cancel</button>
        <button className={"primary"} onClick={doResize}>
          resize
        </button>
      </footer>
    </div>
  )
}
