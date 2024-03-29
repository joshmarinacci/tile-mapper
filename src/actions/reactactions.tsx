import { Bounds, Size } from "josh_js_util"
import { DialogContext } from "josh_react_util"
import React, { useContext } from "react"

import { IconButton, ReactMenuAction } from "../common/common-components"
import { Icons } from "../common/icons"
import { ListFilesDialog } from "../io/ListFilesDialog"
import { LoadFileDialog } from "../io/LoadPNGJSONFileDialog"
import { Actor } from "../model/actor"
import { appendToList } from "../model/base"
import { DocContext, StateContext } from "../model/contexts"
import { GameMap } from "../model/gamemap"
import { ImageFrame, ImageLayer, SImage } from "../model/image"
import { ParticleFX } from "../model/particlefx"
import { PixelFont, PixelGlyph } from "../model/pixelfont"
import { Sheet } from "../model/sheet"
import { SoundFX } from "../model/soundfx"
import { GlobalState } from "../state"
import { AddImageDialog } from "./AddImageDialog"
import { loadPNGJSON } from "./gamedoc"
import { NewDocDialog } from "./NewDocDialog"

function NewDocButton(props: { state: GlobalState }) {
  const dm = useContext(DialogContext)
  const show = () => {
    dm.show(
      <NewDocDialog
        onComplete={(doc) => {
          props.state.setPropValue("doc", doc)
          props.state.setSelection(doc)
        }}
      />,
    )
  }
  return (
    <IconButton
      onClick={show}
      icon={Icons.Document}
      text={"New Game"}
      tooltip={"create a new empty game documenet"}
    />
  )
}

export const NewDocAction: ReactMenuAction = {
  type: "react",
  title: "new",
  icon: Icons.Document,
  makeComponent: (state) => {
    return <NewDocButton state={state} />
  },
}

function LoadDocButton(props: { state: GlobalState }): JSX.Element {
  const dm = useContext(DialogContext)
  const showOpenDialog = () => dm.show(<ListFilesDialog state={props.state} />)
  return (
    <IconButton
      onClick={showOpenDialog}
      icon={Icons.Document}
      text={"Open Existing Game"}
      tooltip={"Load previously saved game from browser storage"}
    />
  )
}

export const LoadLocalStorageAction: ReactMenuAction = {
  type: "react",
  title: "open doc",
  makeComponent: (state) => {
    return <LoadDocButton state={state} />
  },
}

function UploadButton(props: { state: GlobalState }) {
  const { state } = props
  const dm = useContext(DialogContext)

  const showLoadDialog = () => {
    const onComplete = async (file: File) => {
      const doc_proxy = await loadPNGJSON(state, file)
      state.setPropValue("doc", doc_proxy)
    }
    dm.show(<LoadFileDialog state={state} onComplete={onComplete} />)
  }
  return <button onClick={showLoadDialog}>Import doc.JSON.PNG</button>
}

export const UploadPNGJSONAction: ReactMenuAction = {
  type: "react",
  title: "Import Doc",
  makeComponent: (state: GlobalState) => {
    return <UploadButton state={state} />
  },
}

export function AddSheetToDocButton() {
  const doc = useContext(DocContext)
  const state = useContext(StateContext)
  const perform = () => {
    const sheet = new Sheet({
      name: "unnamed sheet",
      tileSize: doc.getPropValue("tileSize"),
    })
    appendToList(doc, "sheets", sheet)
    state.setSelection(sheet)
  }
  return <button onClick={perform}> Add Sheet To Doc </button>
}

export function AddMapToDocButton() {
  const doc = useContext(DocContext)
  const state = useContext(StateContext)
  const perform = () => {
    const map = new GameMap({ name: "new map" })
    appendToList(doc, "maps", map)
    state.setSelection(map)
  }
  return <button onClick={perform}> Add Map To Doc </button>
}

export function AddActorToDocButton() {
  const doc = useContext(DocContext)
  const state = useContext(StateContext)
  const perform = () => {
    const size = new Size(16, 16)
    const sprite = new SImage({ name: "new actor sprite", size: size })
    const layer = new ImageLayer({
      name: "layer",
      opacity: 1.0,
      visible: true,
    })
    const bounds = new Bounds(0, 0, size.w, size.h)
    sprite.appendLayer(layer)
    const frame = new ImageFrame()
    sprite.appendFrame(frame)
    appendToList(doc, "canvases", sprite)
    const actor = new Actor({
      name: "new actor",
    })
    appendToList(doc, "actors", actor)
    state.setSelection(actor)
  }
  return <button onClick={perform}> Add Actor To Doc </button>
}

export function AddCanvasToDocButton() {
  const doc = useContext(DocContext)
  const state = useContext(StateContext)
  const dm = useContext(DialogContext)
  const perform = () => {
    dm.show(
      <AddImageDialog
        onComplete={(size) => {
          const canvas = new SImage({ name: "blank canvas", size: size })
          const layer = new ImageLayer({
            name: "new pixel layer",
            opacity: 1.0,
            visible: true,
          })
          canvas.appendLayer(layer)
          const frame = new ImageFrame()
          canvas.appendFrame(frame)
          appendToList(doc, "canvases", canvas)
          state.setSelectionTarget(layer)
        }}
      />,
    )
  }
  return <button onClick={perform}> Add Canvas To Doc </button>
}

export function AddFontToDocButton() {
  const doc = useContext(DocContext)
  const state = useContext(StateContext)
  const perform = () => {
    const font = new PixelFont({ name: "unnamed font" })
    const glyph = new PixelGlyph({ name: "A" })
    glyph.getPropValue("data").fill(() => -1)
    appendToList(font, "glyphs", glyph)
    appendToList(doc, "fonts", font)
    state.setSelection(font)
  }
  return <button onClick={perform}> Add Font To Doc </button>
}

export function AddSoundFXToDocButton() {
  const doc = useContext(DocContext)
  const state = useContext(StateContext)
  const perform = () => {
    const fx = new SoundFX({ name: "unnamed" })
    appendToList(doc, "assets", fx)
    state.setSelection(fx)
    state.setSelectionTarget(fx)
  }
  return <button onClick={perform}>Add Sound Effect</button>
}
export function AddParticleFXToDocButton() {
  const doc = useContext(DocContext)
  const state = useContext(StateContext)
  const perform = () => {
    const fx = new ParticleFX({ name: "unnamed" })
    appendToList(doc, "assets", fx)
    state.setSelectionTarget(fx)
  }
  return <button onClick={perform}> Add Particle Effect </button>
}
