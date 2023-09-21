import {Bounds, Size} from "josh_js_util"

import {Enemy, Layer, Player} from "./globals"
import {KeyboardManager} from "./keyboard"
import {PhysicsManager} from "./physics"

export type GameMap = {
    name: string,
    layers: Layer[]
}

export class GameState {
    map: GameMap
    private canvas: HTMLCanvasElement
    private viewport: Bounds
    private keyboard: KeyboardManager
    private players: Player[]
    private physics: PhysicsManager
    private enemies: Enemy[]

    constructor(canvas:HTMLCanvasElement, CANVAS_SIZE:Size) {
        this.map = {
            name: 'level1',
            layers: []
        }
        if(canvas) {
            this.canvas = canvas
        } else {
            this.canvas = document.createElement('canvas')
            document.body.append(this.canvas)
        }
        this.canvas.style.border = '1px solid red'
        this.canvas.width = CANVAS_SIZE.w
        this.canvas.height = CANVAS_SIZE.h
        this.keyboard = new KeyboardManager(window)
        this.viewport = new Bounds(0, 0, CANVAS_SIZE.w, CANVAS_SIZE.h)
        const player: Player = {
            type: "player",
            color: 'green',
            tile: {
                uuid: 'smileguy'
            },
            bounds: new Bounds(25, 25, 16, 15),
            vx: 0,
            vy: 0,
            standing: false,
            hidden: false,
            name:'player',
            hitable: true,
        }
        this.players = [player]
        this.enemies = []
        this.physics = new PhysicsManager()
    }

    getCurrentMap() {
        return this.map
    }

    getDrawingSurface() {
        const ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D
        ctx.fillStyle = 'black'
        ctx.fillRect(0,0,this.canvas.width,this.canvas.height)
        return ctx
    }

    getViewport() {
        return this.viewport
    }

    getKeyboard() {
        return this.keyboard
    }

    getPlayers() {
        return this.players
    }

    getEnemies() {
        return this.enemies
    }

    getPhysics() {
        return this.physics
    }

    addLayer(layer: Layer) {
        this.map.layers.push(layer)
    }

    addEnemy(badguy: Enemy) {
        this.enemies.push(badguy)
    }
}
