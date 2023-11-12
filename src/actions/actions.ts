import { Point, Size } from "josh_js_util"

import { Icons } from "../common/icons"
import { Actor } from "../model/actor"
import { PropsBase, removeFromList } from "../model/base"
import { Camera } from "../model/camera"
import { ActorLayer, GameMap, TileLayer } from "../model/gamemap"
import { ImageObjectLayer, ImagePixelLayer, SImage } from "../model/image"
import { ParticleFX } from "../model/particlefx"
import { PixelFont } from "../model/pixelfont"
import { Sheet } from "../model/sheet"
import { SoundFX } from "../model/soundfx"
import { GlobalState } from "../state"
import {
  AddActorLayerToMapAction,
  AddTileLayerToMapAction,
  DeleteMapAction,
  DeleteMapLayerAction,
  ExportMapToPNGAction,
  MoveMapLayerDownAction,
  MoveMapLayerUpAction,
} from "./gamemap"
import {
  AddNewImageObjectLayerAction,
  AddNewImagePixelLayerAction,
  CopyImageToClipboardAction,
  DeleteImageLayerAction,
  ExportImageToPNGAction,
  MoveImageLayerDownAction,
  MoveImageLayerUpAction,
} from "./image"
import { DeleteSheetAction, ExportSheetToPNG } from "./sheets"

export type Shortcut = {
  key: string
  meta: boolean
  shift: boolean
  control: boolean
  alt: boolean
}

export interface MenuAction {
  type: "react" | "simple"
  title: string
  shortcut?: Shortcut
  description?: string
  icon?: Icons
  tags?: string[]
}

export interface SimpleMenuAction extends MenuAction {
  type: "simple"
  perform: (state: GlobalState) => Promise<void>
}

export class ActionRegistry {
  private actions: MenuAction[]
  private by_key: Map<string, MenuAction[]>

  constructor() {
    this.actions = []
    this.by_key = new Map()
  }

  match(e: React.KeyboardEvent): MenuAction | null {
    if (this.by_key.has(e.key)) {
      let actions = this.by_key.get(e.key)
      if (!actions) return null
      actions = actions.filter((a) => a.shortcut?.meta === e.metaKey)
      actions = actions.filter((a) => a.shortcut?.shift === e.shiftKey)
      if (actions.length > 0) return actions[0]
    }
    return null
  }

  register(actions: MenuAction[]) {
    actions.forEach((a) => {
      this.actions.push(a)
      if (a.shortcut) {
        let acts = this.by_key.get(a.shortcut.key)
        if (!acts) acts = []
        acts.push(a)
        this.by_key.set(a.shortcut.key, acts)
      }
    })
  }

  all(): MenuAction[] {
    return this.actions.slice()
  }
}

export const DeleteActorAction: SimpleMenuAction = {
  type: "simple",
  title: "delete actor",
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
export const DeletePixelFontAction: SimpleMenuAction = {
  type: "simple",
  title: "delete font",
  icon: Icons.Trashcan,
  perform: async (state) => {
    const sel = state.getPropValue("selection")
    if (sel instanceof PixelFont) {
      removeFromList(state.getPropValue("doc"), "fonts", sel as PixelFont)
      state.clearSelection()
    }
  },
}
export const DeleteParticleFXAction: SimpleMenuAction = {
  type: "simple",
  title: "delete particle effect",
  icon: Icons.Actor,
  perform: async (state) => {
    const sel = state.getPropValue("selection")
    if (sel instanceof ParticleFX) {
      removeFromList(state.getPropValue("doc"), "assets", sel as ParticleFX)
      state.clearSelection()
    }
  },
}
export const DeleteSoundFXAction: SimpleMenuAction = {
  type: "simple",
  title: "delete sound effect",
  icon: Icons.Actor,
  perform: async (state) => {
    const sel = state.getPropValue("selection")
    if (sel instanceof SoundFX) {
      removeFromList(state.getPropValue("doc"), "assets", sel as SoundFX)
      state.clearSelection()
    }
  },
}

export function drawGrid(
  current: HTMLCanvasElement,
  scale: number,
  tileSize: Size,
  camera: Camera,
) {
  const ctx = current.getContext("2d") as CanvasRenderingContext2D
  ctx.strokeStyle = "#000000"
  ctx.lineWidth = 0.5
  const size = camera.getPropValue("viewport").size()
  ctx.save()
  ctx.beginPath()
  for (let i = 0; i < size.w; i++) {
    ctx.moveTo(i * scale * tileSize.w, 0)
    ctx.lineTo(i * scale * tileSize.w, size.h * scale * tileSize.h)
  }
  for (let i = 0; i < size.h; i++) {
    ctx.moveTo(0, i * scale * tileSize.h)
    ctx.lineTo(size.w * scale * tileSize.h, i * scale * tileSize.w)
  }
  ctx.stroke()

  ctx.beginPath()
  ctx.lineWidth = 3.0
  const mx = new Point(size.w / 2, size.h / 2).floor()
  ctx.moveTo(mx.x * scale * tileSize.w, 0)
  ctx.lineTo(mx.x * scale * tileSize.w, size.h * scale * tileSize.h)
  ctx.moveTo(0, mx.y * scale * tileSize.h)
  ctx.lineTo(size.w * scale * tileSize.h, mx.x * scale * tileSize.h)
  ctx.stroke()
  ctx.restore()
}

export function calculate_context_actions<T>(obj: PropsBase<T>) {
  const actions = []
  if (obj instanceof Sheet) {
    actions.push(DeleteSheetAction)
    actions.push(ExportSheetToPNG)
  }
  if (obj instanceof GameMap) {
    actions.push(DeleteMapAction)
    actions.push(ExportMapToPNGAction)
    actions.push(AddTileLayerToMapAction)
    actions.push(AddActorLayerToMapAction)
  }
  if (obj instanceof TileLayer || obj instanceof ActorLayer) {
    actions.push(DeleteMapLayerAction)
    actions.push(MoveMapLayerUpAction)
    actions.push(MoveMapLayerDownAction)
  }
  if (obj instanceof Actor) {
    actions.push(DeleteActorAction)
  }
  if (obj instanceof ParticleFX) {
    actions.push(DeleteParticleFXAction)
  }
  if (obj instanceof SoundFX) {
    actions.push(DeleteSoundFXAction)
  }
  if (obj instanceof PixelFont) {
    actions.push(DeletePixelFontAction)
  }
  if (obj instanceof SImage) {
    actions.push(DeleteImageAction)
    actions.push(ExportImageToPNGAction)
    actions.push(AddNewImagePixelLayerAction)
    actions.push(AddNewImageObjectLayerAction)
    actions.push(CopyImageToClipboardAction)
  }
  if (obj instanceof ImagePixelLayer || obj instanceof ImageObjectLayer) {
    actions.push(DeleteImageLayerAction)
    actions.push(MoveImageLayerUpAction)
    actions.push(MoveImageLayerDownAction)
  }
  return actions
}
