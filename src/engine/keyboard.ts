export enum KeyCodes {
    ArrowLeft='ArrowLeft',
    ArrowRight='ArrowRight',
    ArrowUp='ArrowUp',
    ArrowDown='ArrowDown',
    Space='Space',
}
type KeyState = {
    down:boolean
}
export class KeyboardManager {
    private state: Map<KeyCodes, KeyState>
    constructor() {
        this.state = new Map<KeyCodes,KeyState>
    }

    public keydown(code:string) {
        if(code in KeyCodes) {
            this.init_key(code as KeyCodes)
            const state = this.state.get(code as KeyCodes) as KeyState
            state.down = true
        }
    }
    public keyup(code:string) {
        if(code in KeyCodes) {
            this.init_key(code as KeyCodes)
            const state = this.state.get(code as KeyCodes) as KeyState
            state.down = false
        }
    }

    private init_key(code: KeyCodes) {
        if(!this.state.has(code as KeyCodes)) {
            this.state.set(code as KeyCodes, {down:false})
        }
    }

    private _dump() {
        for(const [code,state] of this.state.entries()) {
            console.log(code,state)
        }
    }

    isPressed(code:KeyCodes) {
        return this.state.has(code) && this.state.get(code).down
    }
}
