import { ICON_CACHE } from "../iconcache"
import { make_doc_from_json } from "../io/json"
import Icons from "../resources/icons.json"
import StdFont from "../resources/std_font.json"
import { GameAction, GameActionDefs } from "./action"
import { Actor, ActorDefs } from "./actor"
import { ClassRegistry, setGlobalClassRegistry } from "./base"
import { Camera, CameraDefs } from "./camera"
import { GameTest, TestDefs } from "./datamodel"
import { GameDoc, GameDocDefs } from "./gamedoc"
import {
  ActorInstance,
  ActorInstanceDefs,
  ActorLayer,
  ActorLayerDefs,
  GameMap,
  GameMapDefs,
  TileLayer,
  TileLayerDefs,
} from "./gamemap"
import { ImageFrame, ImageFrameDefs, ImageLayer, ImageLayerDefs, SImage, SImageDefs } from "./image"
import { ParticleFX, ParticleFXDefs } from "./particlefx"
import { PhysicsSettings, PhysicsSettingsDefs } from "./physicsSettings"
import { PixelFont, PixelFontDefs, PixelFontListDef, PixelGlyph, PixelGlyphDefs } from "./pixelfont"
import { Sheet, SheetDefs } from "./sheet"
import { SoundFX, SoundFXDefs } from "./soundfx"
import { Tile, TileDefs } from "./tile"

export function get_class_registry() {
  const registry = new ClassRegistry()
  registry.register("Tile", Tile, TileDefs)
  registry.register("Actor", Actor, ActorDefs)
  registry.register("Doc", GameDoc, GameDocDefs)
  registry.register("Camera", Camera, CameraDefs)
  registry.register("GameTest", GameTest, TestDefs)
  registry.register("TileLayer", TileLayer, TileLayerDefs)
  registry.register("ActorInstance", ActorInstance, ActorInstanceDefs)
  registry.register("ActorLayer", ActorLayer, ActorLayerDefs)
  registry.register("Map", GameMap, GameMapDefs)
  registry.register("ImageLayer", ImageLayer, ImageLayerDefs)
  registry.register("ImageFrame", ImageFrame, ImageFrameDefs)
  registry.register("SImage", SImage, SImageDefs)
  registry.register("ParticleFX", ParticleFX, ParticleFXDefs)
  registry.register("PhysicsSettings", PhysicsSettings, PhysicsSettingsDefs)
  registry.register("PixelGlyph", PixelGlyph, PixelGlyphDefs)
  registry.register("PixelFont", PixelFont, PixelFontDefs)
  registry.register("Sheet", Sheet, SheetDefs)
  registry.register("SoundFX", SoundFX, SoundFXDefs)
  registry.register("GameAction", GameAction, GameActionDefs)
  setGlobalClassRegistry(registry)

  const ICONS_DOC = make_doc_from_json(Icons, registry)
  ICONS_DOC.getPropValue("sheets").forEach((sheet) => {
    sheet.getPropValue("tiles").forEach((tile) => {
      ICON_CACHE.register(tile, ICONS_DOC.getPropValue("palette"))
    })
  })

  const DEFAULT_FONT = make_doc_from_json(StdFont, registry)
  PixelFontListDef.withDefault(() => [DEFAULT_FONT.getPropValue("fonts")[0]])

  return registry
}

export const CLASS_REGISTRY = get_class_registry()
