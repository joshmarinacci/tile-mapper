import { UUID } from "./base"

export type ChangeCallback = (canvas: HTMLCanvasElement) => void
type Snapshot = {
  canvas: HTMLCanvasElement
  listeners: Set<ChangeCallback>
}
export class ImageSnapshotCache {
  private listeners: Map<UUID, Snapshot>
  constructor() {
    this.listeners = new Map()
  }

  setImageSnapshot(uuid: UUID, canvas: HTMLCanvasElement) {
    const snap = this.get_snapshot(uuid)
    snap.canvas = canvas
    for (const value of snap.listeners.values()) {
      value(snap.canvas)
    }
  }

  onChange(uuid: UUID, hand: ChangeCallback) {
    this.get_snapshot(uuid).listeners.add(hand)
  }

  offChange(uuid: UUID, hand: ChangeCallback) {
    this.get_snapshot(uuid).listeners.delete(hand)
  }

  private get_snapshot(uuid: UUID): Snapshot {
    if (!this.listeners.has(uuid)) {
      const canvas = document.createElement("canvas")
      canvas.width = 16
      canvas.height = 16
      const ctx = canvas.getContext("2d") as CanvasRenderingContext2D
      ctx.fillStyle = "magenta"
      ctx.fillRect(0, 0, 16, 16)
      this.listeners.set(uuid, {
        listeners: new Set(),
        canvas: canvas,
      })
    }
    return this.listeners.get(uuid) as Snapshot
  }

  getSnapshotCanvas(uuid: UUID) {
    return this.get_snapshot(uuid).canvas
  }
}
