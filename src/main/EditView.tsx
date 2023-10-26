import React from "react"

import { ActorEditView } from "../ActorEditView"
import { PixelFontEditorView } from "../fonteditor/PixelFontEditorView"
import { ImageEditorView } from "../imageeditor/ImageEditorView"
import { MapModeView } from "../mapeditor/MapModeView"
import { PropsBase } from "../model/base"
import { Actor, GameMap, GameTest, PixelFont, Sheet, SImage } from "../model/datamodel"
import { TileSheetEditor } from "../sheeteditor/TileSheetEditor"
import { TestModeView } from "../testeditor/TestModeView"

export function EditView(props: { selection: PropsBase<unknown> | undefined }) {
  const { selection } = props
  if (selection instanceof Sheet) {
    return <TileSheetEditor sheet={selection as Sheet} />
  }
  if (selection instanceof Actor) {
    return <ActorEditView actor={selection as Actor} />
  }
  if (selection instanceof GameMap) {
    return <MapModeView map={selection as GameMap} />
  }
  if (selection instanceof GameTest) {
    return <TestModeView test={selection as GameTest} />
  }
  if (selection instanceof SImage) {
    return <ImageEditorView image={selection as SImage} />
  }
  if (selection instanceof PixelFont) {
    return <PixelFontEditorView font={selection as PixelFont} />
  }
  return (
    <div style={{ padding: "1rem" }} className={"editor-view"}>
      <h3>Select item from the left</h3>
    </div>
  )
}
