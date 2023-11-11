import "./Palette.css"

import { Spacer, toClass } from "josh_react_util"
import React, { useState } from "react"

import { ImagePalette } from "./common"
import { DropdownButton, Pane } from "./common-components"
import { Icons } from "./icons"
import { ListView, ListViewDirection, ListViewOptions } from "./ListView"

const PaletteColorRenderer = (props: {
  value: string | undefined
  selected: boolean
  options: ListViewOptions
}) => {
  const { value, selected, options } = props
  return (
    <div
      className={toClass({
        "palette-color": true,
        selected: selected,
        transparent: value === "transparent",
      })}
      style={{
        backgroundColor: value === "transparent" ? "magenta" : value,
        width: `${options.size}px`,
        height: `${options.size}px`,
      }}
    />
  )
}

export function PaletteColorPickerPane(props: {
  drawColor: string
  setDrawColor: (v: string) => void
  palette: ImagePalette
}) {
  const { drawColor, setDrawColor, palette } = props
  const [size, setSize] = useState(16)
  return (
    <Pane>
      <header>
        <label>Palette</label>
        <Spacer />
        <DropdownButton icon={Icons.Gear}>
          <button onClick={() => setSize(16)}>16px</button>
          <button onClick={() => setSize(32)}>32px</button>
          <button onClick={() => setSize(64)}>64px</button>
          <button onClick={() => setSize(128)}>128px</button>
        </DropdownButton>
      </header>
      <ListView
        className={"palette"}
        direction={ListViewDirection.HorizontalWrap}
        data={palette.colors}
        renderer={PaletteColorRenderer}
        selected={drawColor}
        setSelected={setDrawColor}
        options={{ size: size }}
      />
    </Pane>
  )
}
