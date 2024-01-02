import { Point, Size } from "josh_js_util"

import { Icons } from "../common/icons"
import { Actor } from "../model/actor"
import { PropsBase, removeFromList } from "../model/base"
import { Camera } from "../model/camera"
import { ActorLayer, ColorMapLayer, GameMap, TileLayer } from "../model/gamemap"
import { ImageFrame, ImageLayer, SImage } from "../model/image"
import { ParticleFX } from "../model/particlefx"
import { PixelFont } from "../model/pixelfont"
import { Sheet } from "../model/sheet"
import { SoundFX } from "../model/soundfx"
import { Tile } from "../model/tile"
import { GlobalState } from "../state"
import { DeleteActorAction, DeleteImageAction } from "./actor-actions"
import {
  AddActorLayerToMapAction,
  AddColorLayerToMapAction,
  AddTileLayerToMapAction,
  DeleteMapAction,
  DeleteMapLayerAction,
  ExportMapToPNGAction,
  MoveMapLayerDownAction,
  MoveMapLayerUpAction,
} from "./gamemap"
import {
  AddNewImageLayerAction,
  CopyImageToClipboardAction,
  DeleteImageFrameAction,
  DeleteImageLayerAction,
  ExportImageToGIFAction,
  ExportImageToPNG4XAction,
  ExportImageToPNGAction,
  MoveImageFrameDownAction,
  MoveImageFrameUpAction,
  MoveImageLayerDownAction,
  MoveImageLayerUpAction,
} from "./image"
import {
  AddTileToSheetAction,
  DeleteSelectedTileAction,
  DeleteSheetAction,
  DuplicateSelectedTileAction,
  ExportSheetToPNG,
  FlipTileAroundHorizontalAction,
  FlipTileAroundVerticalAction,
  RotateTile90ClockAction,
  RotateTile90CounterClockAction,
} from "./sheets"

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
  icon: Icons.Trashcan,
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
  icon: Icons.Trashcan,
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
    actions.push(AddTileToSheetAction)
    actions.push(DeleteSheetAction)
    actions.push(ExportSheetToPNG)
  }
  if (obj instanceof Tile) {
    actions.push(DuplicateSelectedTileAction)
    actions.push(FlipTileAroundVerticalAction)
    actions.push(FlipTileAroundHorizontalAction)
    actions.push(RotateTile90ClockAction)
    actions.push(RotateTile90CounterClockAction)
    actions.push(DeleteSelectedTileAction)
  }
  if (obj instanceof GameMap) {
    actions.push(DeleteMapAction)
    actions.push(ExportMapToPNGAction)
    actions.push(AddTileLayerToMapAction)
    actions.push(AddActorLayerToMapAction)
    actions.push(AddColorLayerToMapAction)
  }
  if (obj instanceof TileLayer || obj instanceof ActorLayer || obj instanceof ColorMapLayer) {
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
    actions.push(ExportImageToPNG4XAction)
    actions.push(ExportImageToGIFAction)
    actions.push(AddNewImageLayerAction)
    actions.push(CopyImageToClipboardAction)
  }
  if (obj instanceof ImageLayer) {
    actions.push(DeleteImageLayerAction)
    actions.push(MoveImageLayerUpAction)
    actions.push(MoveImageLayerDownAction)
  }
  if (obj instanceof ImageFrame) {
    actions.push(DeleteImageFrameAction)
    actions.push(MoveImageFrameUpAction)
    actions.push(MoveImageFrameDownAction)
  }
  return actions
}
