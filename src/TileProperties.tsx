import React, {useEffect, useState} from "react"

import {Changed, EditableSprite} from "./model"

export function TileProperties(props: { tile: EditableSprite }) {
    const tile = props.tile
    const [name, setName] = useState(tile.getName())
    useEffect(() => {
        setName(tile.getName())
        const hand = () => setName(tile.getName())
        tile.addEventListener(Changed, hand)
        return () => tile.removeEventListener(Changed, hand)
    }, [tile])
    return <div className={'tile-properties'}>
        <ul className={'props-sheet'}>
            <li>
                <b>name</b>
                <input type={'text'} value={name}
                       onChange={(e) => props.tile.setName(e.target.value)}/>
            </li>
        </ul>
    </div>
}
