import React, { useEffect } from "react";

interface PixelArtProps {
  config: PixelArtConfig;
  grid: PixelArt;
  onClick: (data: PixelData) => void;
  roundedGrid?: boolean;
  className?: string;
}

const displayGrid = (
  pixelArt: PixelArt,
  onClick: (data: PixelData) => void,
  pxSize: number
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
          onClick={onClick}
          color={cellColor}
          key={"cell-" + y + "-" + x}
        />
      ))}
    </div>
  ));
};

const PixelArtMaker: React.FC<PixelArtProps> = ({
  config,
  grid,
  onClick,
  roundedGrid = false,
  className,
}) => {
  return (
    <div
      id={config.gridUID}
      className={"pxm " + (roundedGrid ? "pxm-rounded " : "") + (className ?? "")}
    >
      {displayGrid(grid, onClick, config.pxSize)}
    </div>
  );
};

const Pixel: React.FC<PixelProps> = ({ x, y, color, size, gridUID, onClick }) => {
  const hexc = "#" + color.toString(16);

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
      mouseHold = false;
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
  }, [onClick]);

  return (
    <div
      className="pxm-pixel"
      data-posx={x}
      data-posy={y}
      data-hexc={hexc}
      onClick={() => onClick({ pos: { x, y }, hexColor: hexc, gridUID })}
      style={{
        width: size.toString() + "px",
        height: size.toString() + "px",
        backgroundColor: hexc,
      }}
    />
  );
};

export default PixelArtMaker;
