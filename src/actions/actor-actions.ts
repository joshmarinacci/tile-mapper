import { Icons } from "../common/icons"
import { Actor } from "../model/actor"
import { removeFromList } from "../model/base"
import { SImage } from "../model/image"
import { SimpleMenuAction } from "./actions"

export const DeleteActorAction: SimpleMenuAction = {
  type: "simple",
  title: "delete actor",
  icon: Icons.Trashcan,
  perform: async (state) => {
    const sel = state.getPropValue("selection")
    if (sel instanceof Actor) {
      removeFromList(state.getPropValue("doc"), "actors", sel as Actor)
      state.clearSelection()
    }
  },
}
export const DeleteImageAction: SimpleMenuAction = {
  type: "simple",
  title: "delete image",
  icon: Icons.Trashcan,
  perform: async (state) => {
    const sel = state.getPropValue("selection")
    if (sel instanceof SImage) {
      removeFromList(state.getPropValue("doc"), "canvases", sel as SImage)
      state.clearSelection()
    }
  },
}
