import React from "react"

import { ActorEditView } from "../ActorEditView"
import { CameraEditorView } from "../CameraEditorView"
import { PixelFontEditorView } from "../fonteditor/PixelFontEditorView"
import { ImageEditorView } from "../imageeditor/ImageEditorView"
import { GameMapEditor } from "../mapeditor/GameMapEditor"
import { Camera } from "../model/camera"
import { Actor, GameMap, PixelFont, Sheet, SImage } from "../model/datamodel"
import { ParticleFX } from "../model/particlefx"
import { PhysicsSettings } from "../model/physicsSettings"
import { SoundFX } from "../model/soundfx"
import { ParticleFXEditorView } from "../particleeditor/ParticleFXEditorView"
import { PhysicsSettingEditorView } from "../PhysicsSettingEditorView"
import { TileSheetEditor } from "../sheeteditor/TileSheetEditor"
import { SoundFXEditorView } from "../soundeditor/SoundFXEditorView"
import { SelectionPath } from "../state"

export function EditView(props: { selection: SelectionPath }) {
  if (props.selection.isEmpty()) return <div>nothing</div>
  if ("getUUID" in props.selection.start()) {
    console.log("its a good selection")
  }
  const selection = props.selection.start()
  if (selection instanceof Sheet) {
    return <TileSheetEditor sheet={selection as Sheet} />
  }
  if (selection instanceof Actor) {
    return <ActorEditView actor={selection as Actor} />
  }
  if (selection instanceof GameMap) {
    return <GameMapEditor map={selection as GameMap} />
  }
  if (selection instanceof SImage) {
    return <ImageEditorView image={selection as SImage} />
  }
  if (selection instanceof PixelFont) {
    return <PixelFontEditorView font={selection as PixelFont} />
  }
  if (selection instanceof ParticleFX) {
    return <ParticleFXEditorView fx={selection as ParticleFX} />
  }
  if (selection instanceof SoundFX) {
    return <SoundFXEditorView fx={selection as SoundFX} />
  }
  if (selection instanceof Camera) {
    return <CameraEditorView camera={selection as Camera} />
  }
  if (selection instanceof PhysicsSettings) {
    return <PhysicsSettingEditorView physics={selection as PhysicsSettings} />
  }
  if (!selection) {
    return (
      <div style={{ padding: "1rem" }} className={"editor-view"}>
        <h3>Select item from the left</h3>
      </div>
    )
  }
  return <EditView selection={props.selection.parent()} />
}
