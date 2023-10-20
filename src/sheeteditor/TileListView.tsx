import "./TileSheetView.css"

import { Spacer, toClass } from "josh_react_util"
import React, { useContext, useEffect, useRef, useState } from "react"

import { deleteTile, duplicate_tile, export_bmp } from "../actions/actions"
import { drawEditableSprite, Icons, ImagePalette } from "../common/common"
import {
  DocContext,
  DropdownButton,
  IconButton,
  Pane,
} from "../common/common-components"
import { ListSelect } from "../common/ListSelect"
import {
  ListView,
  ListViewDirection,
  ListViewOptions,
  ListViewRenderer,
} from "../common/ListView"
import { PopupContext } from "../common/popup"
import { ICON_CACHE } from "../iconcache"
import { useWatchProp } from "../model/base"
import { Sheet, Tile } from "../model/datamodel"
import { TileGridView } from "./TileGridView"
import { TilePopupMenu } from "./TilePopupMenu"

type TilePreviewOptions = {
  sheet: Sheet
  showNames: boolean
  showGrid: boolean
  scale: number
  palette: ImagePalette
} & ListViewOptions

export const TilePreviewRenderer: ListViewRenderer<
  Tile,
  TilePreviewOptions
> = (props: {
  value: Tile
  selected: boolean
  options: TilePreviewOptions
}) => {
  const { value, options, selected } = props
  const ref = useRef<HTMLCanvasElement>(null)
  const redraw = () => {
    if (ref.current && value) {
      const canvas = ref.current
      const ctx = canvas.getContext("2d") as CanvasRenderingContext2D
      ctx.fillStyle = ctx.createPattern(
        ICON_CACHE.getIconCanvas("checkerboard"),
        "repeat",
      ) as CanvasPattern
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      drawEditableSprite(ctx, 1, value, options.palette)
    }
  }
  useEffect(() => redraw(), [value])
  useWatchProp(value, "data", () => redraw())
  useWatchProp(value, "name")
  const pm = useContext(PopupContext)
  const showPopup = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault()
    e.stopPropagation()
    pm.show_at(
      <TilePopupMenu value={value} sheet={options.sheet} />,
      e.target,
      "left",
    )
  }
  return (
    <div className={"tile-preview-wrapper"} onContextMenu={showPopup}>
      <canvas
        ref={ref}
        className={toClass({ "tile-preview": true, selected })}
        style={{
          width: `${value.width() * options.scale}px`,
          height: `${value.height() * options.scale}px`,
          border: options.showGrid
            ? "3px solid transparent"
            : "0px solid transparent",
        }}
        width={value.width()}
        height={value.height()}
      ></canvas>
      {options.showNames && <b>{props.value.getPropValue("name")}</b>}
    </div>
  )
}

const SheetPreviewRenderer: ListViewRenderer<Sheet, never> = (props: {
  value: Sheet
  selected: boolean
  options: ListViewOptions
}) => {
  const { selected, value } = props
  return (
    <div
      className={toClass({
        "std-dropdown-item": true,
        selected: selected,
      })}
    >
      <b>{value.getPropValue("name")}</b>
      <i>{value.getPropValue("tiles").length} tiles</i>
    </div>
  )
}

export function TileListView(props: {
  sheet: Sheet
  tile: Tile | undefined
  setTile: (tile: Tile | undefined) => void
  palette: ImagePalette
  editable: boolean
}) {
  const { sheet, tile, setTile, palette, editable } = props
  const showNames = sheet.getPropValue("showNames")
  const showGrid = sheet.getPropValue("showGrid")
  const locked = sheet.getPropValue("locked")
  const view = sheet.getPropValue("viewMode")
  const [scale, setScale] = useState(4)
  const [tiles, setTiles] = useState(sheet.getPropValue("tiles"))
  const add_tile = () => {
    setTile(sheet.addNewTile())
    setTiles(sheet.getPropValue("tiles"))
  }
  const dup_tile = () => {
    if (tile) setTile(duplicate_tile(sheet, tile))
  }
  const delete_tile = () => {
    if (tile) deleteTile(sheet, tile)
    if (sheet.getPropValue("tiles").length > 0) {
      setTile(sheet.getPropValue("tiles")[0])
    } else {
      setTile(undefined)
    }
  }
  const use_grid_view = () => sheet.setPropValue("viewMode", "grid")
  const use_list_view = () => sheet.setPropValue("viewMode", "list")
  useWatchProp(sheet, "showGrid")
  useWatchProp(sheet, "showNames")
  useWatchProp(sheet, "viewMode")
  useWatchProp(sheet, "locked")
  return (
    <div className={"tile-list-view"}>
      {editable && (
        <div className={"toolbar"}>
          <IconButton onClick={add_tile} icon={Icons.Tile} text={"+"} />
          <IconButton onClick={dup_tile} icon={Icons.Duplicate} />
          <IconButton onClick={delete_tile} icon={Icons.Trashcan} />
          <IconButton onClick={use_grid_view} icon={Icons.Grid} />
          <IconButton onClick={use_list_view} icon={Icons.Selection} />
          <Spacer />
          <DropdownButton icon={Icons.Gear}>
            <button onClick={() => sheet.setPropValue("showNames", !showNames)}>
              show names
            </button>
            <button onClick={() => sheet.setPropValue("showGrid", !showGrid)}>
              show grid
            </button>
            <button onClick={() => setScale(1)}>1x</button>
            <button onClick={() => setScale(2)}>2x</button>
            <button onClick={() => setScale(4)}>4x</button>
            <button onClick={() => setScale(8)}>8x</button>
            <button onClick={() => setScale(16)}>16x</button>
            <button onClick={() => sheet.setPropValue("locked", !locked)}>
              {locked ? "unlock" : "lock"}
            </button>
          </DropdownButton>
        </div>
      )}
      {view === "list" && (
        <ListView
          className={"tile-list"}
          selected={tile}
          setSelected={setTile}
          renderer={TilePreviewRenderer}
          data={tiles}
          options={{ showNames, scale, sheet, showGrid, palette }}
          direction={ListViewDirection.HorizontalWrap}
        />
      )}
      {view === "grid" && (
        <TileGridView
          selected={tile}
          setSelected={setTile}
          data={tiles}
          sheet={sheet}
          options={{ showNames, scale, sheet, showGrid, palette, locked }}
        />
      )}
      {editable && (
        <div className={"toolbar"}>
          <button onClick={() => export_bmp(sheet, palette)}>to BMP</button>
        </div>
      )}
    </div>
  )
}

export function CompactSheetAndTileSelector(props: {
  selectedTile: Tile | undefined
  setSelectedTile: (t: Tile | undefined) => void
}) {
  const { selectedTile, setSelectedTile } = props
  const doc = useContext(DocContext)
  const sheets = doc.getPropValue("sheets")
  const [selectedSheet, setSelectedSheet] = useState<Sheet | undefined>(
    sheets[0],
  )
  return (
    <Pane
      header={
        <header>
          <label>Tile Sheet</label>
          <Spacer />
          <ListSelect
            selected={selectedSheet}
            renderer={SheetPreviewRenderer}
            setSelected={setSelectedSheet}
            data={sheets}
            options={undefined as never}
          />
        </header>
      }
    >
      {selectedSheet && (
        <TileListView
          sheet={selectedSheet}
          tile={selectedTile}
          editable={false}
          setTile={(t) => setSelectedTile(t)}
          palette={doc.getPropValue("palette")}
        />
      )}
    </Pane>
  )
}
