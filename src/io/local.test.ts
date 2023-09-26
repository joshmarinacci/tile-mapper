import {describe, expect, it} from "vitest"

import {appendToList} from "../base"
import {Sheet, Tile} from "../datamodel"
import {docToJSON} from "../json"
import {GlobalState} from "../state"
import {deleteLocalDoc, listLocalDocs, loadLocalDoc, saveLocalStorage} from "./local"

class FakeLocalStorage implements Storage{
    // [name: string]: any

    readonly length: number
    private items:Map<string,string>
    constructor() {
        this.length = 0
        this.items = new Map()
    }
    clear(): void {
        this.items.clear()
    }

    getItem(key: string): string | null {
        if(!this.items.has(key)) return null
        return this.items.get(key) as string
    }

    key(index: number): string | null {
        return undefined
    }

    removeItem(key: string): void {
        this.items.delete(key)
    }

    setItem(key: string, value: string): void {
        this.items.set(key,value)
    }
}

describe('json', () => {
    it('should have empty local storage', async () => {
        const state = new GlobalState({
            localStorage:new FakeLocalStorage()
        })
        const index = await listLocalDocs(state)
        expect(index.length).toBe(0)
    })
    it('should save to local storage', async () => {
        const state = new GlobalState({
            localStorage:new FakeLocalStorage()
        })

        expect(state).toBeTruthy()
        await saveLocalStorage(state,false)
    })
    it('should list from local storage', async () => {
        const state = new GlobalState({
            localStorage:new FakeLocalStorage()
        })
        const uuid = state.getPropValue('doc').getUUID()
        console.log("original uuid is",uuid)
        await saveLocalStorage(state,false)

        const list = await listLocalDocs(state)
        console.log("list is",list)
        const found = list.filter(jd => jd.uuid === uuid)
        expect(found.length).toBe(1)
    })

    it('should save and update using local storage', async () => {
        const state = new GlobalState({
            localStorage:new FakeLocalStorage()
        })
        const uuid = state.getPropValue('doc').getUUID()
        console.log("original uuid is",uuid)
        {
            const sheet = new Sheet()
            const doc = state.getPropValue('doc')
            appendToList(doc,'sheets',sheet)
            const tile = new Tile()
            appendToList(sheet,'tiles',tile)
        }
        {
            const json_doc = docToJSON(state.getPropValue('doc'))
            console.log(json_doc)
            expect(json_doc.doc.id).toEqual(uuid)
        }
        {
            await saveLocalStorage(state, false)
            const list = await listLocalDocs(state)
            console.log("list is", list)
            const found = list.filter(jd => jd.uuid === uuid)
            expect(found.length).toBe(1)
        }
        {
            const new_doc = await loadLocalDoc(state, uuid)
            // console.log("new doc is",new_doc)
            expect(new_doc.getUUID()).toEqual(uuid)
            const sheet = new_doc.getPropValue('sheets')[0]
            expect(sheet.getPropValue('tiles').length).toBe(1)
        }

    })

    it('shoudl delete from storage', async () => {
        const state = new GlobalState({
            localStorage:new FakeLocalStorage()
        })
        const uuid = state.getPropValue('doc').getUUID()
        await saveLocalStorage(state, false)
        {
            const list = await listLocalDocs(state)
            expect(list.length).toBe(1)
        }
        await deleteLocalDoc(state,uuid)
        {
            const list = await listLocalDocs(state)
            expect(list.length).toBe(0)
        }
    })
})
