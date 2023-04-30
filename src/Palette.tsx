import {toClass} from "josh_react_util";
import React from "react";
import {ListView} from "./ListView";
import {ImagePalette} from "./common";

function PaletteColorRenderer(props: {
    value: string,
    selected: any,
    setSelected: (value: any) => void
}) {
    const color = props.value
    return <div
        className={toClass({
            'palette-color': true,
            selected: props.selected === props.value,
            transparent: color === 'transparent',
        })}
        style={{
            backgroundColor: color === 'transparent' ? 'magenta' : color,
            width: '32px',
            height: '32px',
        }} onClick={() => {
        props.setSelected(color)
    }
    }></div>
}

export function PaletteColorPickerPane(props: {
    drawColor: string,
    setDrawColor: (v: string) => void,
    palette:ImagePalette,
}) {
    const {drawColor, setDrawColor, palette} = props
    return <div className={'pane'}>
        <header>Palette</header>
        <ListView className={'palette'} data={palette}
                  renderer={PaletteColorRenderer}
                  selected={drawColor}
                  setSelected={setDrawColor}
                  style={{maxWidth: '300px'}}/>
    </div>
}
