export enum KeyCodes {
    ArrowLeft='ArrowLeft',
    ArrowRight='ArrowRight',
    Space='Space',
}
type KeyState = {
    down:boolean
}
export class KeyboardManager {
    private state: Map<KeyCodes, KeyState>
    constructor(target: HTMLElement) {
        this.state = new Map<KeyCodes,KeyState>
        target.addEventListener('keydown', (e) => {
            // console.log(e.key, e.code)
            if(e.code in KeyCodes) {
                this.init_key(e.code as KeyCodes)
                const state = this.state.get(e.code as KeyCodes) as KeyState
                state.down = true
            }
            // this._dump()
        })
        target.addEventListener('keyup', (e) => {
            if(e.code in KeyCodes) {
                this.init_key(e.code as KeyCodes)
                const state = this.state.get(e.code as KeyCodes) as KeyState
                state.down = false
            }
        })
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
