import { useCallback, useState } from "react";

type PixelArtHook = [
  PixelArt,
  PixelArtConfig,
  {
    paintPixel: (pixelData: PixelData, newColor: number) => void;
    resetGrid: () => void;
    fillLine: (color: number, line: number) => void;
    fillColumn: (color: number, column: number) => void;
    fillGrid: (color: number) => void;
  }
];

const getRandomInt = (min: number, max: number) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
};

const RGBToHex = (rgb: string): number => {
  // Choose correct separator
  rgb = rgb.trim();
  const sep = rgb.indexOf(",") > -1 ? "," : " ";
  const isRGBA = rgb.startsWith("rgba");
  // Turn "rgb(r,g,b)" into [r,g,b]
  // Turn "rgb(r,g,b,a)" into [r,g,b,a]
  const sequences = rgb
    .trim()
    .substring(isRGBA ? 5 : 4)
    .split(")")[0]
    .split(sep);

  let r = parseInt(sequences[0]).toString(16),
    g = parseInt(sequences[1]).toString(16),
    b = parseInt(sequences[2]).toString(16),
    a = isRGBA ? Math.floor(+sequences[3] * 255).toString(16) : null;

  if (r.length === 1) r = "0" + r;
  if (g.length === 1) g = "0" + g;
  if (b.length === 1) b = "0" + b;
  if (a?.length === 1) a = "0" + a;

  const hex = r + g + b + (isRGBA ? a : "");
  return parseInt(hex, 16);
};

const stringToColor = (color: string): number => {
  color = color.trim();
  if (color.startsWith("#")) return parseInt(color.substring(1), 16);
  if (color.startsWith("rgb")) return RGBToHex(color);
  throw new Error(`The color "${color}" is not supported.`);
};

const generateRandomUID = () => {
  const alpha = "abcdefghijklmnopqrstuvwxyz013456789";
  let uid = "";
  for (let i = 0; i < 6; i++) {
    uid += alpha[getRandomInt(0, alpha.length)];
  }
  return uid;
};

const init = (w: number, h: number, c: number): PixelArt => {
  let grid: number[][] = [];
  let uid = generateRandomUID();
  for (let y = 0; y < h; y++) {
    grid[y] = [];
    for (let x = 0; x < w; x++) {
      grid[y][x] = c;
    }
  }
  return { uid, grid };
};

const getHTMLElement = (pos: Pos, uid: string): HTMLDivElement | null => {
  const grid = document.getElementById(uid);
  if (grid) {
    const lines = grid.querySelectorAll(".pxm-line");
    if (lines) {
      const line = lines[pos.y];
      const cell = line.children[pos.x] as HTMLDivElement;
      return cell;
    }
  }
  return null;
};

const usePixelArt = (
  width = 16,
  height = 16,
  pxSize = 25,
  initialColor = 0xffffffff
): PixelArtHook => {
  const [pixelArt, setPixelArt] = useState<PixelArt>(init(width, height, initialColor));

  const paintPixel = useCallback((pixelData: PixelData, newColor: number | string) => {
    setPixelArt((currentGrid) => {
      const pos = pixelData.pos;
      const newStringColor = "#" + newColor.toString(16);
      const htmlElement = getHTMLElement(pos, pixelData.gridUID);
      if (htmlElement == null) {
        throw new Error(
          `The pixel you're trying to paint does not exist at pos (${pos.x};${pos.y}) in grid of uid "${pixelData.gridUID}".`
        );
      }
      htmlElement.setAttribute("data-hexc", newStringColor);
      htmlElement.style.backgroundColor = newStringColor;
      currentGrid.grid[pos.y][pos.x] =
        typeof newColor === "string" ? stringToColor(newColor) : newColor;
      return currentGrid;
    });
  }, []);

  const fillLine = useCallback(
    (color: number | string, line: number) => {
      const uid = pixelArt.uid;
      for (let i = 0; i < width; i++) {
        paintPixel({ gridUID: uid, pos: { x: line, y: i } }, color);
      }
    },
    [paintPixel, pixelArt.uid, width]
  );

  const fillColumn = useCallback(
    (color: number | string, column: number) => {
      const uid = pixelArt.uid;
      for (let i = 0; i < width; i++) {
        paintPixel({ gridUID: uid, pos: { x: i, y: column } }, color);
      }
    },
    [paintPixel, pixelArt.uid, width]
  );

  const fillGrid = useCallback(
    (color: number | string) => {
      const uid = pixelArt.uid;
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          paintPixel({ gridUID: uid, pos: { x, y } }, color);
        }
      }
    },
    [height, paintPixel, pixelArt.uid, width]
  );

  const resetGrid = useCallback(() => {
    fillGrid(initialColor);
  }, [fillGrid, initialColor]);

  return [
    pixelArt,
    { width, height, pxSize, initialColor, gridUID: pixelArt.uid },
    { paintPixel, resetGrid, fillColumn, fillLine, fillGrid },
  ];
};

export default usePixelArt;
