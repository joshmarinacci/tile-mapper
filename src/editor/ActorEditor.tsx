import {Point} from "josh_js_util"
import {toClass} from "josh_react_util"
import React, {useState} from "react"

import {appendToList} from "../base"
import {drawEditableSprite} from "../common"
import {Actor, ActorInstance, ActorLayer, GameDoc} from "../datamodel"
import {fillBounds, strokeBounds} from "../engine/util"
import {ListSelect} from "../ListSelect"
import {ListViewRenderer} from "../ListView"
import {TileReferenceView} from "../propsheet"

function findActorForInstance(inst: ActorInstance, doc: GameDoc) {
    const actor_id = inst.getPropValue('actor')
    return doc.getPropValue('actors').find(act => act._id === actor_id)
}

export function drawActorlayer(ctx: CanvasRenderingContext2D, doc: GameDoc, layer: ActorLayer, scale: number, grid: boolean) {
    layer.getPropValue('actors').forEach(inst => {
        const position = inst.getPropValue('position')
        const source = findActorForInstance(inst, doc)
        if (source) {
            const box = source.getPropValue('viewbox').add(position).scale(scale)
            const tileRef = source.getPropValue('tile')
            fillBounds(ctx, box, 'red')
            if (tileRef) {
                const tile = doc.lookup_sprite(tileRef)
                if (tile) {
                    if (tile.cache_canvas) {
                        ctx.drawImage(tile.cache_canvas,
                            //src
                            0, 0, tile.cache_canvas.width, tile.cache_canvas.height,
                            //dst
                            box.x, box.y, box.w, box.h
                        )
                    } else {
                        drawEditableSprite(ctx, scale, tile)
                    }
                }
            }
        }
    })
}

const ActorPreviewRenderer: ListViewRenderer<Actor> = (props: {
    value: Actor,
    selected: boolean,
    index: number,
    doc: GameDoc
}) => {
    const {selected, value } = props
    if (!value) return <div>nothing selected</div>
    return <div
        className={toClass({
            'std-list-item': true,
            selected: selected,
        })}
        style={{
            'minWidth': '10rem',
            justifyContent: 'space-between',
            alignItems: 'center'
        }}
    >
        <b>{value.getPropValue('name')}</b>
        <TileReferenceView tileRef={value.getPropValue('tile')} doc={props.doc}/>
    </div>
}

export function ActorLayerToolbar(props: {
    doc: GameDoc,
    layer: ActorLayer,
    onSelect: (act: ActorInstance) => void
}) {
    const {doc, layer, onSelect} = props
    const [selected, setSelected] = useState<Actor | undefined>(undefined)
    const add_actor = () => {
        if (!selected) return
        const player = new ActorInstance({name: 'new ref', actor: selected._id, position: new Point(50, 30)})
        appendToList(layer, "actors", player)
        onSelect(player)
    }
    return <div className={'toolbar'}>
        <label>actors</label>
        <ListSelect
            doc={doc}
            data={doc.getPropValue('actors')}
            selected={selected}
            setSelected={setSelected}
            renderer={ActorPreviewRenderer}
        />
        <button disabled={!selected} onClick={add_actor}>add actor</button>
    </div>
}

export function drawSelectedActor(ctx: CanvasRenderingContext2D, doc: GameDoc, inst: ActorInstance, scale: number, grid: boolean) {
    const position = inst.getPropValue('position')
    const source = findActorForInstance(inst, doc)
    if (source) {
        const box = source.getPropValue('viewbox')
        strokeBounds(ctx, box.add(position).scale(scale), 'orange', 3)
    }
}

export function findActorAtPosition(doc: GameDoc, layer: ActorLayer, point: Point) {
    return layer.getPropValue('actors').find(inst => {
        const actt = findActorForInstance(inst, doc)
        if (actt) {
            const box = actt.getPropValue('viewbox').add(inst.getPropValue('position'))
            console.log("box is", box)
            if (box.contains(point)) {
                return true
            }
        }
        return false
    })
}
