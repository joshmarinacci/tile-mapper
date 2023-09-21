import {Bounds, Point} from "josh_js_util";
import {KeyboardManager} from "./keyboard";
import {CANVAS_SIZE, Enemy, Layer, Player} from "./globals";
import {PhysicsManager} from "./physics";

export type GameMap = {
    name: string,
    layers: Layer[]
}

export class GameState {
    map: GameMap
    private canvas: HTMLCanvasElement;
    private viewport: Bounds;
    private keyboard: KeyboardManager;
    private players: Player[];
    private physics: PhysicsManager;
    private enemies: Enemy[];

    constructor() {
        this.map = {
            name: 'level1',
            layers: []
        }
        this.canvas = document.createElement('canvas')
        this.canvas.style.border = '1px solid red'
        this.canvas.width = CANVAS_SIZE.w
        this.canvas.height = CANVAS_SIZE.h
        document.body.append(this.canvas)
        this.keyboard = new KeyboardManager(window)
        this.viewport = new Bounds(0, 0, CANVAS_SIZE.w, CANVAS_SIZE.h)
        let player: Player = {
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
        let ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D
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
