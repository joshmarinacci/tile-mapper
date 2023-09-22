import "./Palette.css"

import {toClass} from "josh_react_util"
import React from "react"

import {ImagePalette} from "./common"
import {ListView, ListViewDirection} from "./ListView"

const PaletteColorRenderer = (props:{value:string, selected:boolean}) => {
    const {value, selected} = props
    return <div
        className={toClass({
            'palette-color': true,
            selected: selected,
            transparent: value === 'transparent',
        })}
        style={{
            backgroundColor: value === 'transparent' ? 'magenta' : value,
            width: '32px',
            height: '32px',
        }}
    />
}

export function PaletteColorPickerPane(props: {
    drawColor: string,
    setDrawColor: (v: string) => void,
    palette:ImagePalette,
}) {
    const {drawColor, setDrawColor, palette} = props
    return <div className={'pane'}>
        <header>Palette</header>
        <ListView className={'palette'}
                  direction={ListViewDirection.HorizontalWrap}
                  data={palette}
                  renderer={PaletteColorRenderer}
                  selected={drawColor}
                  setSelected={setDrawColor}
                  style={{
                      minWidth: '94px',
                      maxWidth: '300px'
                    }}/>
    </div>
}
