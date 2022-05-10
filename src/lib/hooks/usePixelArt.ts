import { useCallback, useState } from "react";

type PixelArtHook = [PixelArt, PixelArtConfig, (pixelData: PixelData, newColor: number) => void];

const getRandomInt = (min: number, max: number) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
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

  const paintPixel = useCallback((pixelData: PixelData, newColor: number) => {
    setPixelArt((currentGrid) => {
      const pos = pixelData.pos;
      const newStringColor = "#" + newColor.toString(16);
      const htmlElement = getHTMLElement(pos, pixelData.gridUID);
      if (htmlElement === null) {
        throw new Error(
          `The pixel you're trying to paint does not exist at pos (${pos.x};${pos.y}) in grid of uid "${pixelData.gridUID}".`
        );
      }
      htmlElement.setAttribute("data-hexc", newStringColor);
      htmlElement.style.backgroundColor = newStringColor;
      currentGrid.grid[pos.y][pos.x] = newColor;
      return currentGrid;
    });
  }, []);

  return [pixelArt, { width, height, pxSize, initialColor, gridUID: pixelArt.uid }, paintPixel];
};

export default usePixelArt;
