import "./DividerColumnBox.css"

import React, {ReactNode} from "react"

import {ICON_CACHE} from "../iconcache"
import {Icons} from "./common"

export function DividerColumnBox(props: {
    value: number,
    onChange: (value: number) => void,
    children: ReactNode
}) {
    return <div className={'divider'} style={{
        position: 'relative'
    }}>
        <div className={'container'}>
            {props.children}
        </div>
        <div className={'handler'}
             onMouseDown={(e) => {
                 const startX = e.screenX
                 const initial_width = props.value
                 // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                 // @ts-ignore
                 const handler = (e) => {
                     props.onChange(e.screenX - startX + initial_width)
                 }
                 window.addEventListener("mousemove", handler)
                 const upHandler = () => {
                     window.removeEventListener('mousemove', handler)
                     window.removeEventListener('mouseup', upHandler)
                 }
                 window.addEventListener("mouseup", upHandler)
             }}
        >
            <img
                alt={'drag-handle'}
                src={ICON_CACHE.getIconUrl(Icons.DividerHandle)}
                width={16}
                draggable={false}
                style={{ imageRendering:'pixelated',
                userSelect:'none',
            }}/>

        </div>
    </div>
}
