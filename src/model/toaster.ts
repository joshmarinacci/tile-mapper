export type Callback = () => void

class Observable {
  listeners: Map<string, Callback[]>
  constructor() {
    this.listeners = new Map()
  }
  on(name: string, cb: Callback) {
    if (!this.listeners.has(name)) {
      this.listeners.set(name, [])
    }
    this.listeners.get(name)?.push(cb)
  }
  off(name: string, cb: Callback) {
    const listeners = this.listeners.get(name) as Callback[]
    this.listeners.set(
      name,
      listeners.filter((c) => c !== cb),
    )
  }
}
export class ToasterModel extends Observable {
  public message: string
  constructor() {
    super()
    this.message = "nothing"
  }
  fireMessage(aMessageHere: string) {
    this.message = aMessageHere
    console.log("firing", aMessageHere)
    this.fire("append")
  }

  private fire(name: string) {
    this.listeners.get(name)?.forEach((cb) => cb())
  }
}
