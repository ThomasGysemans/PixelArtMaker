import { useCallback, useState } from "react";
import PixelArtRegistry from "../pixelArtRegistry";

type PixelArtHook = [
  PixelArt,
  PixelArtConfig,
  {
    paintPixel: (pixelData: PixelData, newColor: number) => void;
    resetGrid: () => void;
    fillLine: (color: number, line: number) => void;
    fillColumn: (color: number, column: number) => void;
    fillGrid: (color: number) => void;
    applyGrid: (grid: Grid) => void;
    registry: PixelArtRegistry;
  }
];

const getRandomInt = (min: number, max: number) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
};

/**
 * Converts RGB or RGBA into its hexadecimal value.
 * @param {string} rgb The string in the RGB or RGBA format.
 * @returns {number} The hexadecimal value as a number.
 */
export const RGBToHex = (rgb: string | number[]): number => {
  // Choose correct separator
  rgb = typeof rgb === "string" ? rgb.trim() : rgb;
  const sep = typeof rgb === "string" ? (rgb.indexOf(",") > -1 ? "," : " ") : null;
  const isRGBA = typeof rgb === "string" ? rgb.startsWith("rgba") : rgb.length === 4;
  // Turn "rgb(r,g,b)" into [r,g,b]
  // Turn "rgb(r,g,b,a)" into [r,g,b,a]
  const sequences =
    typeof rgb === "string"
      ? rgb
          .trim()
          .substring(isRGBA ? 5 : 4)
          .split(")")[0]
          .split(sep!)
      : rgb;

  let r = parseInt(sequences[0] as string).toString(16),
    g = parseInt(sequences[1] as string).toString(16),
    b = parseInt(sequences[2] as string).toString(16),
    a = isRGBA
      ? (+sequences[3] >= 1 ? +sequences[3] : Math.floor(+sequences[3] * 255)).toString(16)
      : null;

  if (r.length === 1) r = "0" + r;
  if (g.length === 1) g = "0" + g;
  if (b.length === 1) b = "0" + b;
  if (a?.length === 1) a = "0" + a;

  const hex = r + g + b + (isRGBA ? a : "");
  return parseInt(hex, 16);
};

/**
 * Converts a color represented as a string into its hexadecimal value (number).
 * @param color The color as a string.
 * @returns {number} The hexadecimal value.
 */
export const stringToColor = (color: string): number => {
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

  const applyGrid = useCallback(
    (grid: Grid) => {
      for (let y = 0; y < grid.length; y++) {
        for (let x = 0; x < grid[y].length; x++) {
          console.log(
            `painting (${x};${y}) is of color ${grid[y][x]} (#${grid[y][x].toString(16)}))`
          );
          paintPixel({ gridUID: pixelArt.uid, pos: { x, y } }, grid[y][x]);
        }
      }
    },
    [paintPixel, pixelArt.uid]
  );

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
    {
      paintPixel,
      resetGrid,
      fillColumn,
      fillLine,
      fillGrid,
      applyGrid,
      registry: new PixelArtRegistry(pixelArt.grid, applyGrid),
    },
  ];
};

export default usePixelArt;
