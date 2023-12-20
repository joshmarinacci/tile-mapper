import { Size } from "josh_js_util"
import { describe, expect, it } from "vitest"

import { appendToList, restoreClassFromJSON } from "./base"
import { get_class_registry } from "./index"
import { PixelFont, PixelGlyph } from "./pixelfont"

describe("pixel font persistence", () => {
  it("should save a single font pixel glyph", async () => {
    const reg = get_class_registry()
    const glyph = new PixelGlyph({
      name: "A",
      codepoint: 68,
      size: new Size(10, 10),
    })
    glyph.getPropValue("data").fill((n) => -1)

    expect(glyph.getPropValue("name")).toBe("A")
    expect(glyph.getPropValue("codepoint")).toBe(68)

    const json = glyph.toJSON(reg)
    expect(json.props.name).toBe("A")

    const glyph2 = restoreClassFromJSON(reg, json)
    expect(glyph2.getPropValue("name")).toBe("A")
    expect(glyph2.getPropValue("codepoint")).toBe(68)
    expect(glyph.getUUID()).toBe(glyph2.getUUID())
  })
  it("should save a pixel font", async () => {
    const reg = get_class_registry()
    const glyph = new PixelGlyph({ name: "A" })
    glyph.getPropValue("data").fill((n) => -1)
    const font = new PixelFont({
      name: "pixio",
    })
    appendToList(font, "glyphs", glyph)
    expect(font.getPropValue("name")).toBe("pixio")
    expect(font.getPropValue("glyphs").length).toBe(1)
    const glyph2 = font.getPropValue("glyphs")[0]
    expect(glyph2.getPropValue("descent")).toBe(2)
    expect(glyph2.getPropValue("data").size()).toBe(16 * 16)

    const json = font.toJSON(reg)
    const font2 = restoreClassFromJSON(reg, json)
    expect(font2.getPropValue("name")).toBe("pixio")
  })
})
