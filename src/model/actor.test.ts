import { Bounds } from "josh_js_util"
import { describe, expect, it } from "vitest"

import { Actor } from "./actor"
import { restoreClassFromJSON } from "./base"
import { get_class_registry } from "./index"
import { PhysicsSettings } from "./physicsSettings"

describe("actor persistence", () => {
  it("should create an empty actor ", async () => {
    const actor = new Actor()
    expect(actor.getPropValue("name")).toEqual("unnamed")
    expect(actor.getPropValue("state")).toEqual({})
    expect(actor.getPropValue("actions")).toEqual([])
    expect(actor.getPropValue("physics").getPropValue("actors")).toEqual(true)
    expect(actor.getPropValue("physics").getPropValue("gravity")).toEqual(true)
    expect(actor.getPropValue("physics").getPropValue("tiles")).toEqual(true)
    expect(actor.getPropValue("physics").getPropValue("bounds")).toEqual(new Bounds(0, 0, 16, 16))
    expect(actor.getPropValue("view").getPropValue("visible")).toEqual(true)
    expect(actor.getPropValue("view").getPropValue("kind")).toEqual("none")
    expect(actor.getPropValue("view").getPropValue("reference")).toEqual(null)
    expect(actor.getPropValue("view").getPropValue("bounds")).toEqual(new Bounds(0, 0, 16, 16))
  })
  it("should save an actor ", async () => {
    const actor = new Actor({
      name: "mister player",
    })
    actor.setPropValue("state", { foo: "bar" })
    expect(actor.getPropValue("state")).toEqual({ foo: "bar" })

    const json = actor.toJSON(get_class_registry())
    expect(json.class).toEqual("Actor")
    expect(json.props.name).toEqual("mister player")
    console.log(json.props.state)
    expect(json.props.state).toEqual({ foo: "bar" })
  })
  it("should restore an actor", async () => {
    const actor = new Actor({
      name: "mister player",
    })
    actor.setPropValue("state", { foo: "bar" })
    const json = actor.toJSON(get_class_registry())

    const actor2 = restoreClassFromJSON(get_class_registry(), json)
    expect(actor2.getPropValue("name")).toEqual("mister player")
    expect(actor2.getPropValue("state")).toEqual({ foo: "bar" })
  })
  it("should save view settings", async () => {
    const actor = new Actor({
      name: "mister player",
    })
    const view = actor.getPropValue("view")
    view.setPropValue("kind", "sprite")
    view.setPropValue("visible", true)
    view.setPropValue("reference", "fooid")

    const json = actor.toJSON(get_class_registry())
    const actor2 = restoreClassFromJSON(get_class_registry(), json)
    expect(actor2.getPropValue("name")).toEqual("mister player")
    expect(actor2.getPropValue("view").getPropValue("visible")).toEqual(true)
    expect(actor2.getPropValue("view").getPropValue("kind")).toEqual("sprite")
    expect(actor2.getPropValue("view").getPropValue("reference")).toEqual("fooid")
  })
  it("should have events for sub objects", async () => {
    const actor = new Actor({})
    let changed = false
    actor.onAny(() => {
      console.log("changed")
      changed = true
    })
    actor.setPropValue("name", "foo")

    changed = false
    expect(actor.getPropValue("view").getPropValue("visible")).toBe(true)
    actor.getPropValue("view").setPropValue("visible", false)
    expect(changed).toBeTruthy()
  })
})
