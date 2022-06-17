import React, { useCallback, useEffect } from "react";
import type PixelArtRegistry from "./pixelArtRegistry";

interface PixelArtProps {
  config: PixelArtConfig;
  model: PixelArt;
  onClick: (data: PixelData) => void;
  roundedGrid?: boolean;
  className?: string;
  registry?: PixelArtRegistry;
}

const displayGrid = (
  pixelArt: PixelArt,
  pxSize: number,
  onClick: (data: PixelData) => void,
  onPixelDrawn: () => void
): React.ReactNode => {
  return pixelArt.grid.map((line, y) => (
    <div
      className={"pxm-line " + (y === pixelArt.grid.length - 1 ? "pxm-last-line" : "")}
      key={"line-" + y}
    >
      {line.map((cellColor, x) => (
        <Pixel
          x={x}
          y={y}
          gridUID={pixelArt.uid}
          size={pxSize}
          color={cellColor}
          key={"cell-" + y + "-" + x}
          onClick={onClick}
          onPixelDrawn={onPixelDrawn}
        />
      ))}
    </div>
  ));
};

const PixelArtMaker: React.FC<PixelArtProps> = ({
  config,
  model,
  onClick,
  roundedGrid = false,
  className,
  registry,
}) => {
  const onPixelDrawn = useCallback(() => {
    registry?.registerState(model.grid, registry.ACTIONS.drawnPixel);
  }, [model.grid, registry]);

  const onPixelsDrawnOnMouseDown = useCallback(() => {
    registry?.registerState(model.grid, registry.ACTIONS.multipleDrawnPixels);
  }, [model.grid, registry]);

  useEffect(() => {
    let mouseHold = false;
    let heldTimeout: NodeJS.Timeout;
    let drawnPixelsOnHold: PixelData[] = [];

    const onMouseDown = () => {
      heldTimeout = setTimeout(function () {
        mouseHold = true;
      }, 200);
    };

    const onMouseUp = () => {
      clearTimeout(heldTimeout);
      if (mouseHold) {
        mouseHold = false;
        drawnPixelsOnHold = [];
        onPixelsDrawnOnMouseDown();
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (mouseHold) {
        const target = e.target as HTMLElement;
        if (target) {
          if (target.classList.contains("pxm-pixel")) {
            const pos = { x: parseInt(target.dataset.posx!), y: parseInt(target.dataset.posy!) };
            const line = target.parentElement;
            const grid = line?.parentElement;
            if (grid && grid.classList.contains("pxm") && grid.hasAttribute("id")) {
              const uid = grid.getAttribute("id")!;
              const pixelData = { gridUID: uid, pos };
              let alreadyDrawn = false;
              for (let drawnPixel of drawnPixelsOnHold) {
                if (
                  drawnPixel.gridUID === uid &&
                  drawnPixel.pos.x === pos.x &&
                  drawnPixel.pos.y === pos.y
                ) {
                  alreadyDrawn = true;
                  break;
                }
              }
              if (!alreadyDrawn) {
                onClick(pixelData);
                drawnPixelsOnHold.push(pixelData);
              }
            }
          }
        }
      }
    };

    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("mousemove", onMouseMove);

    return () => {
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, [onClick, onPixelsDrawnOnMouseDown]);

  return (
    <div
      id={config.gridUID}
      className={"pxm " + (roundedGrid ? "pxm-rounded " : "") + (className ?? "")}
    >
      {displayGrid(model, config.pxSize, onClick, onPixelDrawn)}
    </div>
  );
};

const Pixel: React.FC<PixelProps> = ({ x, y, color, size, gridUID, onClick, onPixelDrawn }) => {
  const hexc = color === null ? color : color.startsWith("#") ? color : "#" + color;

  return (
    <div
      className="pxm-pixel"
      data-posx={x}
      data-posy={y}
      data-hexc={hexc}
      onClick={() => {
        onClick({ pos: { x, y }, hexColor: hexc, gridUID });
        onPixelDrawn();
      }}
      style={{
        width: size.toString() + "px",
        height: size.toString() + "px",
        backgroundColor: hexc ?? undefined,
      }}
    />
  );
};

export default PixelArtMaker;
