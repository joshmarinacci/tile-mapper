import "./SImageEditorView.css"

import { DialogContext, Spacer } from "josh_react_util"
import { canvas_to_blob } from "josh_web_util"
import React, { useContext, useState } from "react"

import {
  AddNewImageLayerAction,
  ExportImageToGIFAction,
  ExportImageToPNGAction,
  MoveImageLayerDownAction,
  MoveImageLayerUpAction,
} from "../actions/image"
import { DropdownButton, IconButton, Pane, ToolbarActionButton } from "../common/common-components"
import { Icons } from "../common/icons"
import { ListView, ListViewDirection } from "../common/ListView"
import { ShareImageDialog } from "../common/ShareImageDialog"
import { DocContext, StateContext } from "../model/contexts"
import { ImageFrame, ImageLayer, SImage } from "../model/image"
import { drawImage } from "./drawing"
import { FrameItemRenderer } from "./FrameItemRenderer"
import { ImageEditorCanvas } from "./ImageEditorCanvas"
import { LayerItemRenderer } from "./LayerItemRenderer"
import { ResizeImageDialog } from "./ResizeImageDialog"

export function ImageEditorView(props: { image: SImage }) {
  const { image } = props
  if (image.frames().length < 1) image.appendFrame(new ImageFrame())
  const doc = useContext(DocContext)
  const state = useContext(StateContext)
  const palette = doc.palette()
  const [layer, setLayer] = useState<ImageLayer | undefined>(() => image.layers()[0])
  const [frame, setFrame] = useState<ImageFrame | undefined>(() => image.frames()[0])

  const addEmptyFrame = () => {
    image.addEmptyFrame()
  }
  const addCopyFrame = () => {
    if (frame) {
      image.cloneAndAddFrame(frame)
    }
  }

  const dm = useContext(DialogContext)

  const sharePNG = async () => {
    const scale = 4
    const canvas = document.createElement("canvas")
    const size = image.size().scale(scale)
    canvas.width = size.w
    canvas.height = size.h
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D
    const frame = image.frames()[0]
    drawImage(doc, ctx, image, palette, scale, frame)

    const blob = await canvas_to_blob(canvas)
    dm.show(<ShareImageDialog blob={blob} />)
  }

  const resize_image = () => {
    dm.show(<ResizeImageDialog image={image} />)
  }

  return (
    <>
      <div className={"tool-column"}>
        <Pane key={"layer-list"} title={"layers"} collapsable={true}>
          <div className={"toolbar"}>
            <ToolbarActionButton action={AddNewImageLayerAction} />
            <Spacer />
            <DropdownButton icon={Icons.Gear}>
              <ToolbarActionButton action={MoveImageLayerUpAction} />
              <ToolbarActionButton action={MoveImageLayerDownAction} />
              <IconButton
                onClick={() => resize_image()}
                icon={Icons.Resize}
                tooltip={"resize layer"}
                text={"resize layer"}
              />
              <ToolbarActionButton action={ExportImageToPNGAction} />
              <IconButton icon={Icons.Share} onClick={sharePNG} text={"share png"} />
              <ToolbarActionButton action={ExportImageToGIFAction} />
            </DropdownButton>
          </div>
          <ListView
            className={"layers"}
            selected={layer}
            setSelected={(layer) => {
              setLayer(layer)
              state.setSelectionTarget(layer)
            }}
            renderer={LayerItemRenderer}
            data={image.layers()}
            direction={ListViewDirection.VerticalFill}
            options={undefined as never}
          />
        </Pane>
        <Pane key={"frame-list"} title={"frames"} collapsable={true}>
          <div className={"toolbar"}>
            <label>Frame</label>
            <IconButton onClick={addEmptyFrame} icon={Icons.Plus} tooltip={"add empty frame"} />
            <IconButton onClick={addCopyFrame} icon={Icons.Duplicate} tooltip={"add copy frame"} />
          </div>
          <ListView
            className={"frames"}
            selected={frame}
            setSelected={(frame) => {
              setFrame(frame)
              state.setSelectionTarget(frame)
            }}
            renderer={FrameItemRenderer}
            data={image.frames()}
            direction={ListViewDirection.HorizontalWrap}
            options={{
              image: image,
              palette: palette,
              doc: doc,
            }}
          />
        </Pane>
      </div>
      {layer && frame && <ImageEditorCanvas image={image} layer={layer} frame={frame} />}
    </>
  )
}
