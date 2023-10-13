import "./MapEditor.css";

import React, { useContext, useState } from "react";

import { DocContext } from "../common/common-components";
import { DividerColumnBox } from "../common/DividerColumnBox";
import { PropSheet } from "../common/propsheet";
import { PropsBase } from "../model/base";
import { GameMap, MapLayerType, Sheet, Tile } from "../model/datamodel";
import { CompactSheetAndTileSelector } from "../sheeteditor/TileListView";
import { GlobalState } from "../state";
import { LayerEditor } from "./LayerEditor";
import { LayerList } from "./LayerList";

export function MapModeView(props: { state: GlobalState; map: GameMap }) {
  const doc = useContext(DocContext);
  const selectedMap = props.map;
  const layers = selectedMap.getPropValue("layers");
  const sheets = doc.getPropValue("sheets") as Sheet[];
  const [selectedTile, setSelectedTile] = useState<Tile | undefined>(
    sheets[0].getPropValue("tiles")[0],
  );
  const [selectedLayer, setSelectedLayer] = useState<
    PropsBase<MapLayerType> | undefined
  >(layers[0]);
  const [columnWidth, setColumnWidth] = useState(300);

  return (
    <div
      className={"map-editor"}
      style={{
        gridTemplateColumns: `${columnWidth}px 1fr`,
      }}
    >
      {!selectedMap && <div>no map selected</div>}
      <DividerColumnBox value={columnWidth} onChange={setColumnWidth}>
        <CompactSheetAndTileSelector
          selectedTile={selectedTile}
          setSelectedTile={setSelectedTile}
        />
        <LayerList
          key={"layer-list"}
          editable={true}
          map={selectedMap}
          layer={selectedLayer}
          setSelectedLayer={setSelectedLayer}
        />
        <PropSheet target={selectedLayer} title={"Layer Info"} />
      </DividerColumnBox>
      <LayerEditor
        key={"layer-editor"}
        map={props.map}
        layer={selectedLayer}
        tile={selectedTile}
        setSelectedTile={setSelectedTile}
      />
    </div>
  );
}
