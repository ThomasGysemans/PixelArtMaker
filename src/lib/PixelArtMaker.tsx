import React from "react";

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
