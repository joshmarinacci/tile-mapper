import { canvas_to_blob, forceDownloadBlob } from "josh_web_util"
import { encode } from "modern-gif"

import { Icons } from "../common/icons"
import { drawImage } from "../imageeditor/drawing"
import { removeFromList } from "../model/base"
import { GameDoc } from "../model/gamedoc"
import { ImageFrame, ImageLayer, SImage } from "../model/image"
import { GlobalState } from "../state"
import { SimpleMenuAction } from "./actions"

export const exportImageToPNG = async (doc: GameDoc, image: SImage, scale: number) => {
  const canvas = document.createElement("canvas")
  const size = image.getPropValue("size").scale(scale)
  canvas.width = size.w
  canvas.height = size.h
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D
  const palette = doc.getPropValue("palette")
  const frame = image.frames()[0]
  drawImage(doc, ctx, image, palette, scale, frame)

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
export const ExportImageToPNG4XAction: SimpleMenuAction = {
  type: "simple",
  title: "export image to PNG 4x",
  icon: Icons.Download,
  perform: async (state: GlobalState) => {
    const doc = state.getPropValue("doc")
    const image = state.getPropValue("selection")
    if (image instanceof SImage) {
      await exportImageToPNG(doc, image, 4)
    }
  },
}

async function exportImageToGIF(doc: GameDoc, image: SImage, scale: number) {
  const size = image.size().scale(scale)
  const palette = doc.getPropValue("palette")
  const drawFrame = (currentFrame: ImageFrame) => {
    const canvas = document.createElement("canvas")
    const size = image.size().scale(scale)
    canvas.width = size.w
    canvas.height = size.h
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D
    drawImage(doc, ctx, image, palette, scale, currentFrame)
    return canvas
  }

  const frames = []
  for (const frame of image.frames()) {
    frames.push({
      imageData: drawFrame(frame),
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

export const AddNewImageLayerAction: SimpleMenuAction = {
  type: "simple",
  icon: Icons.Plus,
  title: "pixel layer",
  perform: async (state) => {
    const path = state.getSelectionPath()
    const start = path.start()
    const parent = path.parent().start()
    if (start instanceof ImageLayer && parent instanceof SImage) new_image_layer(parent)
    if (start instanceof ImageFrame && parent instanceof SImage) new_image_layer(parent)
    if (start instanceof SImage) new_image_layer(start)
  },
}
const new_image_layer = (image: SImage) => {
  const layer = new ImageLayer({
    name: "new pixel layer",
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
    if (sel instanceof ImageLayer) {
      const image = state.getSelectionPath().parent().start()
      if (image instanceof SImage) {
        removeFromList(image, "layers", sel)
        state.clearSelection()
      }
    }
  },
}

export const DeleteImageFrameAction: SimpleMenuAction = {
  type: "simple",
  icon: Icons.Trashcan,
  title: "delete frame",
  perform: async (state) => {
    const path = state.getSelectionPath()
    const start = path.start()
    const parent = path.parent().start()
    if (start instanceof ImageFrame && parent instanceof SImage) {
      removeFromList(parent, "frames", start)
      state.setSelectionTarget(parent)
    }
  },
}

export const MoveImageLayerUpAction: SimpleMenuAction = {
  type: "simple",
  title: "move layer up",
  icon: Icons.UpArrow,
  perform: async (state) => {
    const path = state.getSelectionPath()
    const start = path.start()
    const parent = path.parent().start()
    if (start instanceof ImageLayer && parent instanceof SImage) {
      move_layer_up(start, parent)
    }
  },
}

export const MoveImageFrameUpAction: SimpleMenuAction = {
  type: "simple",
  title: "move frame up",
  icon: Icons.UpArrow,
  perform: async (state) => {
    const path = state.getSelectionPath()
    const start = path.start()
    const parent = path.parent().start()
    if (start instanceof ImageFrame && parent instanceof SImage) {
      move_frame_up(start, parent)
    }
  },
}

export const MoveImageLayerDownAction: SimpleMenuAction = {
  type: "simple",
  title: "move layer down",
  icon: Icons.DownArrow,
  perform: async (state) => {
    const path = state.getSelectionPath()
    const start = path.start()
    const parent = path.parent().start()
    if (start instanceof ImageLayer && parent instanceof SImage) {
      move_layer_down(start, parent)
    }
  },
}

export const MoveImageFrameDownAction: SimpleMenuAction = {
  type: "simple",
  title: "move frame down",
  icon: Icons.DownArrow,
  perform: async (state) => {
    const path = state.getSelectionPath()
    const start = path.start()
    const parent = path.parent().start()
    if (start instanceof ImageFrame && parent instanceof SImage) {
      move_frame_down(start, parent)
    }
  },
}

const move_layer_down = (ch: ImageLayer, image: SImage) => {
  if (!ch) return
  let layers = image.getPropValue("layers")
  layers = layers.slice()
  const n = layers.indexOf(ch)
  if (n >= layers.length) return
  layers.splice(n, 1)
  layers.splice(n + 1, 0, ch)
  image.setPropValue("layers", layers)
}

const move_frame_down = (ch: ImageFrame, image: SImage) => {
  if (!ch) return
  let layers = image.getPropValue("frames")
  layers = layers.slice()
  const n = layers.indexOf(ch)
  if (n >= layers.length) return
  layers.splice(n, 1)
  layers.splice(n + 1, 0, ch)
  image.setPropValue("frames", layers)
}

const move_layer_up = (ch: ImageLayer, image: SImage) => {
  if (!ch) return
  let layers = image.getPropValue("layers")
  layers = layers.slice()
  const n = layers.indexOf(ch)
  if (n <= 0) return
  layers.splice(n, 1)
  layers.splice(n - 1, 0, ch)
  image.setPropValue("layers", layers)
}

const move_frame_up = (ch: ImageFrame, image: SImage) => {
  if (!ch) return
  let frames = image.getPropValue("frames")
  frames = frames.slice()
  const n = frames.indexOf(ch)
  if (n <= 0) return
  frames.splice(n, 1)
  frames.splice(n - 1, 0, ch)
  image.setPropValue("frames", frames)
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
