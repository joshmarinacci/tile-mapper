import React, { useContext } from "react"

import { ActorEditView } from "../ActorEditView"
import { StateContext } from "../common/common-components"
import { PixelFontEditorView } from "../fonteditor/PixelFontEditorView"
import { ImageEditorView } from "../imageeditor/ImageEditorView"
import { MapModeView } from "../mapeditor/MapModeView"
import { PropsBase } from "../model/base"
import { Actor, GameMap, GameTest, PixelFont, Sheet, SImage } from "../model/datamodel"
import { TileSheetEditor } from "../sheeteditor/TileSheetEditor"
import { TestModeView } from "../testeditor/TestModeView"

export function EditView(props: { selection: PropsBase<unknown> | undefined }) {
  const { selection } = props
  const state = useContext(StateContext)
  if (selection instanceof Sheet) {
    return <TileSheetEditor state={state} sheet={selection as Sheet} />
  }
  if (selection instanceof Actor) {
    return <ActorEditView state={state} actor={selection as Actor} />
  }
  if (selection instanceof GameMap) {
    return <MapModeView state={state} map={selection as GameMap} />
  }
  if (selection instanceof GameTest) {
    return <TestModeView state={state} test={selection as GameTest} />
  }
  if (selection instanceof SImage) {
    return <ImageEditorView state={state} image={selection as SImage} />
  }
  if (selection instanceof PixelFont) {
    return <PixelFontEditorView state={state} font={selection as PixelFont} />
  }
  return (
    <div style={{ padding: "1rem" }} className={"editor-view"}>
      <h3>Select item from the left</h3>
    </div>
  )
}
