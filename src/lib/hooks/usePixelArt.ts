import { useCallback, useState } from "react";
import PixelArtRegistry from "../pixelArtRegistry";

type PixelArtHook = [
  PixelArt,
  PixelArtConfig,
  {
    paintPixel: (pixelData: PixelData, newColor: string) => void;
    resetGrid: () => void;
    fillLine: (color: string, line: number) => void;
    fillColumn: (color: string, column: number) => void;
    fillGrid: (color: string) => void;
    applyGrid: (grid: Grid) => void;
    createPNG: () => void;
    loadPNG: (fileInput: React.MutableRefObject<HTMLInputElement | null>) => void;
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

const init = (w: number, h: number, c?: string): PixelArt => {
  let grid: Grid = [];
  let uid = generateRandomUID();
  for (let y = 0; y < h; y++) {
    grid[y] = [];
    for (let x = 0; x < w; x++) {
      grid[y][x] = c === undefined ? null : c;
    }
  }
  return { uid, grid, width: w, height: h };
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

const usePixelArt = (width = 16, height = 16, pxSize = 25, initialColor?: string): PixelArtHook => {
  const [pixelArt, setPixelArt] = useState<PixelArt>(init(width, height, initialColor));

  const paintPixel = useCallback((pixelData: PixelData, newColor: string | null) => {
    setPixelArt((currentGrid) => {
      const pos = pixelData.pos;
      const newStringColor =
        newColor === null ? null : !newColor.startsWith("#") ? "#" + newColor : newColor;
      const htmlElement = getHTMLElement(pos, pixelData.gridUID);
      if (htmlElement == null) {
        throw new Error(
          `The pixel you're trying to paint does not exist at pos (${pos.x};${pos.y}) in grid of uid "${pixelData.gridUID}".`
        );
      }
      if (newStringColor) {
        htmlElement.setAttribute("data-hexc", newStringColor);
      } else {
        htmlElement.removeAttribute("data-hexc");
      }
      htmlElement.style.backgroundColor = newStringColor as string; // to enforce the default value to take over (which is transparent)
      currentGrid.grid[pos.y][pos.x] = newColor;
      return currentGrid;
    });
  }, []);

  const applyGrid = useCallback(
    (grid: Grid) => {
      for (let y = 0; y < grid.length; y++) {
        for (let x = 0; x < grid[y].length; x++) {
          paintPixel({ gridUID: pixelArt.uid, pos: { x, y } }, grid[y][x]);
        }
      }
    },
    [paintPixel, pixelArt.uid]
  );

  const fillLine = useCallback(
    (color: string, line: number) => {
      const uid = pixelArt.uid;
      for (let i = 0; i < width; i++) {
        paintPixel({ gridUID: uid, pos: { x: line, y: i } }, color);
      }
    },
    [paintPixel, pixelArt.uid, width]
  );

  const fillColumn = useCallback(
    (color: string, column: number) => {
      const uid = pixelArt.uid;
      for (let i = 0; i < width; i++) {
        paintPixel({ gridUID: uid, pos: { x: i, y: column } }, color);
      }
    },
    [paintPixel, pixelArt.uid, width]
  );

  const fillGrid = useCallback(
    (color: string | null) => {
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
    fillGrid(initialColor === undefined ? null : initialColor);
  }, [fillGrid, initialColor]);

  const createPNG = useCallback(() => {
    // Drawn the image based on the hexadecimal colors
    const canvas = document.createElement("canvas");
    canvas.width = pixelArt.width;
    canvas.height = pixelArt.height;
    const context = canvas.getContext("2d");
    if (context) {
      const pixSize = 1;
      for (var i = 0; i < pixelArt.grid.length; i++) {
        var col = pixelArt.grid[i];
        for (var j = 0; j < col.length; j++) {
          if (col[j] === null) {
            continue;
          }
          context.fillStyle = "#" + col[j]; // #hex format
          context.fillRect(j * pixSize, i * pixSize, pixSize, pixSize);
        }
      }
    }
    // Get the URL
    const dataURL = canvas.toDataURL("image/png", 1.0);
    // Download
    const anchor = document.createElement("a");
    anchor.setAttribute("href", dataURL);
    anchor.setAttribute("download", dataURL);
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  }, [pixelArt]);

  // Called onChange for input:file
  const loadPNG = useCallback(
    (fileInput: React.MutableRefObject<HTMLInputElement | null>) => {
      if (fileInput.current == null) return;
      if (fileInput.current.files == null) return;
      if (fileInput.current.files[0] == null) return;
      const file: File = fileInput.current!.files![0];
      const image = new Image();
      image.src = URL.createObjectURL(file);
      image.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        const context = canvas.getContext("2d");
        if (context) {
          context.drawImage(image, 0, 0, image.width, image.height);
          const imageData = context.getImageData(0, 0, image.width, image.height);
          const getPixel = (imgData: ImageData, index: number) => {
            const i = index * 4;
            const d = imgData.data;
            return [d[i], d[i + 1], d[i + 2], d[i + 3]]; // Returns array [R,G,B,A]
          };
          // The hexadecimal values of the colors ordered in a grid
          // where each value is a pixel.
          let grid: Grid = [];
          for (let y = 0; y < imageData.height; y++) {
            grid[y] = [];
            for (let px = 0; px < imageData.width; px++) {
              const pixelIndex = y * imageData.width + px;
              const pixel = getPixel(imageData, pixelIndex);
              grid[y][px] = pixel[3] === 0 ? null : RGBToHex(pixel).toString(16);
            }
          }
          applyGrid(grid);
        }
      };
    },
    [applyGrid]
  );

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
      createPNG,
      loadPNG,
      registry: new PixelArtRegistry(pixelArt.grid, applyGrid),
    },
  ];
};

export default usePixelArt;
