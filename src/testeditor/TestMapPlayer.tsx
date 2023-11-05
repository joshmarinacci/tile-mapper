import React, { useState } from "react"

import { Icons } from "../common/common"
import { ToggleButton } from "../common/common-components"
import { useWatchProp } from "../model/base"
import { GameTest } from "../model/datamodel"
import { GameDoc } from "../model/gamedoc"
import { PlayTest } from "./PlayTest"

export function TestMapPlayer(props: { test: GameTest; doc: GameDoc }) {
  const { test, doc } = props
  const mapid = test.getPropValue("map")
  const map = mapid ? doc.getPropValue("maps").find((map) => map.getUUID() === mapid) : undefined
  const [playing, setPlaying] = useState(false)
  const [zoom, setZoom] = useState(3)
  const [grid, setGrid] = useState(false)
  const togglePlaying = () => setPlaying(!playing)
  const [physicsDebug, setPhysicsDebug] = useState(false)
  useWatchProp(test, "map")
  return (
    <>
      <div className={"toolbar"}>
        <button onClick={() => togglePlaying()}>{playing ? "pause" : "play"}</button>
        <label>{test.getPropValue("name") as string}</label>
        <button onClick={() => setZoom(zoom + 1)}>+</button>
        <label>{zoom}</label>
        <button onClick={() => setZoom(zoom - 1)}>-</button>
        <ToggleButton
          onClick={() => setGrid(!grid)}
          icon={Icons.Grid}
          selected={grid}
          selectedIcon={Icons.GridSelected}
        />
        <button onClick={() => setPhysicsDebug(!physicsDebug)}>collisons</button>
      </div>
      {map && (
        <PlayTest
          playing={playing}
          doc={doc}
          map={map}
          test={test}
          zoom={zoom}
          grid={grid}
          physicsDebug={physicsDebug}
        />
      )}
    </>
  )
}
