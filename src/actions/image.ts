import { canvas_to_blob, forceDownloadBlob } from "josh_web_util"
import { encode } from "modern-gif"

import { Icons } from "../common/icons"
import { drawImage } from "../imageeditor/ImageEditorView"
import { PropsBase, removeFromList } from "../model/base"
import { GameDoc } from "../model/gamedoc"
import { ImageLayerType, ImageObjectLayer, ImagePixelLayer, SImage } from "../model/image"
import { GlobalState } from "../state"
import { SimpleMenuAction } from "./actions"

export const exportImageToPNG = async (doc: GameDoc, image: SImage, scale: number) => {
  const canvas = document.createElement("canvas")
  const size = image.getPropValue("size").scale(scale)
  canvas.width = size.w
  canvas.height = size.h
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D
  const palette = doc.getPropValue("palette")
  drawImage(doc, ctx, image, palette, scale, 0)

  const blob = await canvas_to_blob(canvas)
  forceDownloadBlob(`${image.getPropValue("name") as string}.${scale}x.png`, blob)
}

export const ExportImageToPNGAction: SimpleMenuAction = {
  type: "simple",
  title: "export image to PNG 1x",
  icon: Icons.Download,
  perform: async (state: GlobalState) => {
    const doc = state.getPropValue("doc")
    const image = state.getPropValue("selection")
    if (image instanceof SImage) {
      await exportImageToPNG(doc, image, 1)
    }
  },
}

async function exportImageToGIF(doc: GameDoc, image: SImage, scale: number) {
  const size = image.size().scale(scale)
  const palette = doc.getPropValue("palette")
  const drawFrame = (currentFrame: number) => {
    const canvas = document.createElement("canvas")
    const size = image.size().scale(scale)
    canvas.width = size.w
    canvas.height = size.h
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D
    drawImage(doc, ctx, image, palette, scale, currentFrame)
    return canvas
  }

  const frames = []
  for (let i = 0; i < image.getPropValue("frameCount"); i++) {
    frames.push({
      imageData: drawFrame(i),
      delay: 250,
    })
  }

  const output = await encode({
    width: size.w,
    height: size.h,
    frames: frames,
  })
  const blob = new Blob([output], { type: "image/gif" })
  // window.open(URL.createObjectURL(blob))
  forceDownloadBlob(`${image.getPropValue("name")}.gif`, blob)
}

export const ExportImageToGIFAction: SimpleMenuAction = {
  type: "simple",
  title: "export image to GIF 10x",
  icon: Icons.Download,
  perform: async (state: GlobalState) => {
    const doc = state.getPropValue("doc")
    const image = state.getPropValue("selection")
    if (image instanceof SImage) {
      await exportImageToGIF(doc, image, 10)
    }
  },
}

export const AddNewImagePixelLayerAction: SimpleMenuAction = {
  type: "simple",
  icon: Icons.Plus,
  title: "pixel layer",
  perform: async (state) => {
    const path = state.getSelectionPath()
    if (path.start() instanceof SImage) {
      new_pixel_layer(path.start() as SImage)
    }
  },
}
const new_pixel_layer = (image: SImage) => {
  const layer = new ImagePixelLayer({
    name: "new pixel layer",
    opacity: 1.0,
    visible: true,
  })
  image.appendLayer(layer)
}
export const AddNewImageObjectLayerAction: SimpleMenuAction = {
  type: "simple",
  icon: Icons.Plus,
  title: "object layer",
  perform: async (state) => {
    const path = state.getSelectionPath()
    if (path.start() instanceof SImage) {
      new_object_layer(path.start() as SImage)
    }
  },
}
const new_object_layer = (image: SImage) => {
  const layer = new ImageObjectLayer({
    name: "new object layer",
    opacity: 1.0,
    visible: true,
  })
  image.appendLayer(layer)
}

export const DeleteImageLayerAction: SimpleMenuAction = {
  type: "simple",
  icon: Icons.Trashcan,
  title: "delete layer",
  perform: async (state) => {
    const sel = state.getSelectionPath().start()
    if (sel instanceof ImagePixelLayer || sel instanceof ImageObjectLayer) {
      const image = state.getSelectionPath().parent().start()
      if (image instanceof SImage) {
        removeFromList(image, "layers", sel)
        state.clearSelection()
      }
    }
  },
}

export const MoveImageLayerUpAction: SimpleMenuAction = {
  type: "simple",
  title: "move layer up",
  icon: Icons.UpArrow,
  perform: async (state) => {
    const path = state.getSelectionPath()
    if (path.start() instanceof ImagePixelLayer || path.start() instanceof ImageObjectLayer) {
      const image = path.parent().start() as SImage
      move_layer_up(path.start() as PropsBase<ImageLayerType>, image)
    }
  },
}

export const MoveImageLayerDownAction: SimpleMenuAction = {
  type: "simple",
  title: "move layer down",
  icon: Icons.DownArrow,
  perform: async (state) => {
    const path = state.getSelectionPath()
    if (path.start() instanceof ImagePixelLayer || path.start() instanceof ImageObjectLayer) {
      const image = path.parent().start() as SImage
      move_layer_down(path.start() as PropsBase<ImageLayerType>, image)
    }
  },
}

const move_layer_down = (layer: PropsBase<ImageLayerType>, image: SImage) => {
  if (!layer) return
  let layers = image.getPropValue("layers")
  layers = layers.slice()
  const n = layers.indexOf(layer)
  if (n >= layers.length) return
  layers.splice(n, 1)
  layers.splice(n + 1, 0, layer)
  image.setPropValue("layers", layers)
}

const move_layer_up = (layer: PropsBase<ImageLayerType>, image: SImage) => {
  if (!layer) return
  let layers = image.getPropValue("layers")
  layers = layers.slice()
  const n = layers.indexOf(layer)
  if (n <= 0) return
  layers.splice(n, 1)
  layers.splice(n - 1, 0, layer)
  image.setPropValue("layers", layers)
}

export const CopyImageToClipboardAction: SimpleMenuAction = {
  type: "simple",
  title: "copy image to clipboard",
  perform: async (state: GlobalState) => {
    const path = state.getSelectionPath()
    if (path.start() instanceof SImage) {
      const doc = state.getPropValue("doc")
      const image = path.start() as unknown as SImage
      const scale = 2
      const canvas = document.createElement("canvas")
      const size = image.getPropValue("size").scale(scale)
      canvas.width = size.w
      canvas.height = size.h
      const ctx = canvas.getContext("2d") as CanvasRenderingContext2D
      const palette = doc.getPropValue("palette")
      drawImage(doc, ctx, image, palette, scale, 0)
      try {
        const blob = await canvas_to_blob(canvas)
        await navigator.clipboard.write([
          new ClipboardItem({
            "image/png": blob,
          }),
        ])
      } catch (e) {
        console.log("could not copy to clipboard")
      }
    }
  },
}
