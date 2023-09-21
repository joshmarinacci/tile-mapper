import {Bounds, Size} from "josh_js_util"

import {JSONGameStruct, TileCache} from "./cache"
import {GameMap, GameState} from "./gamestate"
import {Player} from "./globals"
import {TilemapLayer} from "./tilemaplayer"

function updateViewport(viewport: Bounds, players: Player[], SCALE:number) {
    players.forEach(play => {
        const p = play.bounds.scale(SCALE)
        const vl = viewport.left() + 200
        const vr = viewport.right() - 200
        const pl = p.left()
        const pr = p.right()
        if (pr > vr) {
            viewport.x -= (vr - pr)
        }
        if (pl < vl) {
            viewport.x -= (vl - pl)
            if (viewport.x < 0) viewport.x = 0
        }
    })
}

function gameLoop(state: GameState, dt: number) {
    const scale = 4
    const map: GameMap = state.getCurrentMap()
    const ctx = state.getDrawingSurface()
    const viewport = state.getViewport()
    const players = state.getPlayers()
    state.getPhysics().updatePlayer(players, map.layers, state.getKeyboard(), cache)
    state.getPhysics().updateEnemies(state.getEnemies(), map.layers, cache)
    updateViewport(viewport, players, scale)
    ctx.fillStyle = 'black'
    ctx.save()
    map.layers.forEach(layer => layer.drawSelf(ctx, viewport, cache, scale))
    ctx.restore()
}

const cache = new TileCache()

export class Engine {
    constructor() {
        console.log('making an engine')
    }

    async start() {
        const res = await fetch('./mario.json')
        const mario = await res.json() as JSONGameStruct
        mario.sheets.forEach(sht => cache.loadSheet(sht, mario.color_palette))
        const terrain = new TilemapLayer()
        terrain.wrapping = false
        terrain.loadFromString(new Size(32, 10),
            `
      xxxx xxxx xxxx xxxx xxxx xxxx xxxx xxxx
      x000 x000 0000 0000 0000 0000 0000 000x
      x000 x000 0000 000x 0000 0000 0000 000x
      x000 x000 0000 000x 0000 0000 0000 000x
      x000 0xxx 0000 000x 0000 0000 0000 000x
      x000 0000 0000 000x 0000 0000 0000 000x
      xx00 0000 0000 000x 0000 0000 0000 000x
      xx00 00x0 0000 0000 0000 0000 0000 000x
      xx00 xxxx 0000 000x 0000 0000 0000 000x
      xxxx xxxx xxxx xxxx xxxx xxxx xxxx xxxx
      `,
            {
                'x': 'ground',
                '0': 'transparent',
            })
        terrain.blocking = true
        const scenery = new TilemapLayer()
        scenery.loadFromString(new Size(16, 10),
            `
        0000 0000 0000 0000
        0ab0 0000 0000 0000
        0000 0000 0000 0000
        0000 0000 0000 0000
        0000 0000 0000 0000
        0000 0000 0000 0000
        0005 0000 0000 0000
        0013 4000 0000 0000
        0123 3400 0000 0000
        0000 0000 0000 0000
        `,
            {
                '0': 'sky',
                '1': 'hill1',
                '2': 'hill2',
                '3': 'hill3',
                '4': 'hill4',
                '5': 'hill5',
                'a': 'cloud1',
                'b': 'cloud2',
            })
        scenery.scrollSpeed = 0.8
        scenery.blocking = false
        // const actors = new ActorsLayer()
        // actors.blocking = true
        // const overlay = new OverlayLayer()
        const state = new GameState(document.createElement('canvas'), new Size(640,480))
        state.addLayer(scenery)//,terrain, actors, overlay])
        state.addLayer(terrain)
        // state.addLayer(actors)
        // state.addLayer(overlay)
        // state.addLayer(state.getPhysics())
        // state.getPlayers().forEach(ply => actors.addActor(ply))
        // const powerup: Item = {
        //     type: "item",
        //     name: 'health',
        //     tile: {
        //         uuid: 'heart',
        //     },
        //     bounds: new Bounds(3 * 16, 5 * 16, 16, 16),
        //     color: 'red',
        //     hidden: false
        // }
        // actors.addActor(powerup)
        // const badguy: Enemy = {
        //     type: 'enemy',
        //     name: 'badguy',
        //     tile: {
        //         uuid: 'meanie',
        //     },
        //     vx: 0.5,
        //     bounds: new Bounds(4 * 16, 7 * 16, 16, 16),
        //     color: 'cyan',
        //     hidden: false
        // }
        // actors.addActor(badguy)
        // state.addEnemy(badguy)

        // function render(t: number) {
        //     gameLoop(state, t)
        //     requestAnimationFrame(render)
        // }

        // requestAnimationFrame(render)
    }
}
