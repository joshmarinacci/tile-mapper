import "./console-log-view.css"

import { DialogContext, Spacer } from "josh_react_util"
import { useContext, useEffect, useRef, useState } from "react"
import { ConsoleInterface } from "retrogami-engine/dist/scripting"

import { ToggleButton } from "../common/common-components"
import { Icons } from "../common/icons"
import { get_class_registry } from "../model"
import { DefList, PropsBase, PropValues, useWatchProp } from "../model/base"
import { DocContext } from "../model/contexts"
import { NameDef } from "../model/datamodel"
import { GameMap } from "../model/gamemap"
import { Observable } from "../util"
import { GamePlayer } from "./GamePlayer"

type LoggerType = {
  name: string
}
const LoggerTypeDefs: DefList<LoggerType> = {
  name: NameDef,
}
class PersistentLogger extends PropsBase<LoggerType> implements ConsoleInterface {
  private logs: string[]
  constructor(opts: PropValues<LoggerType>) {
    super(LoggerTypeDefs, opts)
    this.logs = []
  }
  log(...args: any[]): void {
    console.log("PERSITENT", ...args)
    this.logs.push(args.join(","))
    this.setPropValue("name", this.logs.length + "")
  }

  getLogs() {
    return this.logs
  }
}
function ConsoleLogView(props: { logger: PersistentLogger }) {
  const [items, setItems] = useState<string[]>([])
  useWatchProp(props.logger, "name", () => setItems(props.logger.getLogs()))
  return (
    <div className={"console-log-view"}>
      <ul>
        {items.map((it, i) => (
          <li key={i}>{it}</li>
        ))}
      </ul>
    </div>
  )
}

function PropToggleButton(props: {
  observerable: Observable
  property: string
  selectedIcon?: Icons
  icon?: Icons
  text: string
}) {
  const { observerable, property } = props
  const [value, setValue] = useState(observerable.getProperty(property))
  useEffect(() => {
    const hand = () => {
      console.log("hand changed")
      setValue(observerable.getProperty(property))
    }
    observerable.on(property, hand)
    return () => {
      observerable.off(property, hand)
    }
  }, [observerable])

  const toggle = () => {
    const value = props.observerable.getProperty(props.property)
    console.log("toggling", value)
    props.observerable.setProperty(props.property, !value)
  }
  return (
    <ToggleButton
      onClick={toggle}
      icon={props.icon}
      selected={value}
      selectedIcon={props.selectedIcon}
      text={props.text}
    />
  )
}

export function PlayTest(props: { map: GameMap }) {
  const doc = useContext(DocContext)
  const [logger] = useState(() => new PersistentLogger({ name: "logger" }))
  const tileSize = doc.getPropValue("tileSize")
  const camera = doc.getPropValue("camera")
  const physics = doc.getPropValue("physics")
  const ref = useRef<HTMLCanvasElement>(null)
  const [player] = useState(() => new GamePlayer())
  const [zoom, setZoom] = useState(3)
  useEffect(() => player.setProperty("scale", zoom), [zoom])
  const startPlaying = () => {
    if (ref.current) {
      // player.setLogger(logger)
      player.start(ref.current, doc.toJSON(get_class_registry()))
    }
  }
  const dm = useContext(DialogContext)
  const dismiss = () => {
    player.stop()
    dm.hide()
  }
  const viewport = camera.getPropValue("viewport")
  return (
    <div
      className={"dialog"}
      style={{
        maxWidth: "80vw",
        minWidth: "80vw",
        maxHeight: "80vh",
        minHeight: "80vh",
      }}
    >
      <header>Play test</header>
      <section className={"vbox"}>
        <div className={"toolbar"}>
          <button onClick={startPlaying}>play</button>
          <button onClick={() => setZoom(zoom + 1)}>zoom in</button>
          <label>{zoom}</label>
          <button onClick={() => setZoom(zoom - 1)}>zoom out</button>
        </div>
        <div className={"toolbar"}>
          <label>Debug</label>
          <PropToggleButton text={"grid"} property={"grid"} observerable={player} />
          <PropToggleButton text={"physics"} property={"physics"} observerable={player} />
          <PropToggleButton text={"viewport"} property={"viewport"} observerable={player} />
          <PropToggleButton text={"actors"} property={"actor"} observerable={player} />
        </div>
        <div className={"hbox"}>
          <canvas
            ref={ref}
            tabIndex={0}
            width={viewport.w * tileSize.w * zoom}
            height={viewport.h * tileSize.h * zoom}
            style={{
              alignSelf: "start",
            }}
          ></canvas>
          {/*<div*/}
          {/*  className={"vbox"}*/}
          {/*  style={{*/}
          {/*    overflow: "clip",*/}
          {/*  }}*/}
          {/*>*/}
          {/*    <PropSheet target={camera} collapsable={true} collapsed={true} title={"camera"} />*/}
          {/*    <PropSheet target={physics} collapsable={true} collapsed={true} title={"physics"} />*/}
          {/*  </div>*/}
        </div>
        <ConsoleLogView logger={logger} />
      </section>
      <footer>
        <Spacer />
        <button onClick={dismiss}>dismiss</button>
      </footer>
    </div>
  )
}
