import { Point, Size } from "josh_js_util";
import { HBox } from "josh_react_util";
import React, {
  MouseEvent,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { drawGrid } from "../actions/actions";
import { Icons, ImagePalette } from "../common/common";
import {
  DocContext,
  IconButton,
  ToggleButton,
} from "../common/common-components";
import { ICON_CACHE } from "../iconcache";
import { useWatchProp } from "../model/base";
import { Tile } from "../model/datamodel";

function calculateDirections() {
  return [new Point(-1, 0), new Point(1, 0), new Point(0, -1), new Point(0, 1)];
}

function bucketFill(tile: Tile, target: number, replace: number, at: Point) {
  if (target === replace) return;
  const v = tile.getPixel(at);
  if (v !== target) return;
  if (v === target) {
    tile.setPixel(replace, at);
    calculateDirections().forEach((dir) => {
      const pt = at.add(dir);
      if (tile.isValidIndex(pt)) bucketFill(tile, target, replace, pt);
    });
  }
}

export function PixelGridEditor(props: {
  tile: Tile;
  selectedColor: number;
  palette: ImagePalette;
  setSelectedColor: (v: number) => void;
}) {
  const doc = useContext(DocContext);
  const { selectedColor, palette, tile } = props;
  const [down, setDown] = useState<boolean>(false);
  const [grid, setGrid] = useState<boolean>(false);
  const [fillOnce, setFillOnce] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(5);
  const dpi = window.devicePixelRatio;
  const scale = Math.pow(2, zoom);
  const ref = useRef<HTMLCanvasElement>(null);
  const redraw = () => {
    if (ref.current) {
      const canvas = ref.current;
      const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
      ctx.fillStyle = "magenta";
      ctx.fillStyle = ctx.createPattern(
        ICON_CACHE.getIconCanvas("checkerboard"),
        "repeat",
      ) as CanvasPattern;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const sc = scale * dpi;
      const size = new Size(tile.width(), tile.height());
      for (let i = 0; i < tile.width(); i++) {
        for (let j = 0; j < tile.height(); j++) {
          const v: number = tile.getPixel(new Point(i, j));
          ctx.fillStyle = palette.colors[v];
          ctx.fillRect(i * sc, j * sc, sc, sc);
        }
      }
      drawGrid(canvas, (scale / size.w) * dpi, size, size);
    }
  };
  useEffect(() => redraw(), [down, grid, zoom, tile]);
  useWatchProp(tile, "data", () => redraw());

  const canvasToImage = (e: MouseEvent<HTMLCanvasElement>) => {
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    return new Point(e.clientX, e.clientY)
      .subtract(new Point(rect.left, rect.top))
      .scale(1 / scale)
      .floor();
  };

  const canSize = new Size(tile.width(), tile.height()).scale(scale);

  return (
    <div
      className={"pane"}
      style={{
        overflow: "scroll",
        maxWidth: "unset",
      }}
    >
      <header>Edit</header>
      <HBox className={"hbox toolbar"}>
        <ToggleButton
          onClick={() => setGrid(!grid)}
          icon={Icons.Grid}
          selected={grid}
          selectedIcon={Icons.GridSelected}
        />
        <ToggleButton
          onClick={() => setFillOnce(true)}
          icon={Icons.PaintBucket}
          selected={fillOnce}
        />
        <IconButton onClick={() => setZoom(zoom + 1)} icon={Icons.Plus} />
        <label>{zoom}</label>
        <IconButton onClick={() => setZoom(zoom - 1)} icon={Icons.Minus} />
      </HBox>
      <canvas
        ref={ref}
        style={{
          border: "1px solid black",
          width: `${canSize.w}px`,
          height: `${canSize.h}px`,
        }}
        width={canSize.w * dpi}
        height={canSize.h * dpi}
        onContextMenu={(e) => {
          e.preventDefault();
        }}
        onMouseDown={(e) => {
          if (e.button === 2) {
            props.setSelectedColor(tile.getPixel(canvasToImage(e)));
            e.stopPropagation();
            e.preventDefault();
            return;
          }
          if (fillOnce) {
            const pt = canvasToImage(e);
            const current_color = tile.getPixel(pt);
            bucketFill(tile, current_color, selectedColor, pt);
            setFillOnce(false);
            return;
          }
          setDown(true);
          tile.setPixel(selectedColor, canvasToImage(e));
          doc.markDirty(tile.getUUID());
        }}
        onMouseMove={(e) => {
          if (down) {
            tile.setPixel(selectedColor, canvasToImage(e));
          }
        }}
        onMouseUp={() => setDown(false)}
      ></canvas>
    </div>
  );
}
