import {useCallback, useState} from "react";
import type React from "react";

type PixelArtHook = [
  PixelArt,
  React.Dispatch<React.SetStateAction<PixelArt>>,
  {
    paintPixel: (pixelData: PixelData, newColor: string) => void;
    resetGrid: () => void;
    fillLine: (color: string, line: number) => void;
    fillColumn: (color: string, column: number) => void;
    fillGrid: (color: string) => void;
    applyGrid: (grid: Grid) => void;
    setDimensions: (
      width: number | null,
      height: number | null,
      callback?: (model: PixelArt) => void
    ) => void;
  }
];

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

const init = (w: number, h: number, c?: string): PixelArtInitialisation => {
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
      return line.children[pos.x] as HTMLDivElement;
    }
  }
  return null;
};

const usePixelArt = (width = 16, height = 16, pxSize = 25, initialColor?: string): PixelArtHook => {
  const [pixelArt, setPixelArt] = useState<PixelArt>({
    ...init(width, height, initialColor),
    pxSize,
  });

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

  const setDimensions = useCallback((width: number | null, height: number | null) => {
    setPixelArt((v) => {
      if (width !== null) v.width = width;
      if (height !== null) v.height = height;
      let newGrid: Grid = [];
      for (let y = 0; y < v.height; y++) {
        newGrid[y] = [];
        for (let x = 0; x < v.width; x++) {
          let currentElement: string | null = null;
          if (v.grid[y] !== undefined && v.grid[y][x] !== undefined) {
            currentElement = v.grid[y][x];
          }
          newGrid[y][x] = currentElement;
        }
      }
      v.grid = newGrid;
      return v;
    });
  }, []);

  const applyGrid = useCallback(
    (grid: Grid) => {
      if (pixelArt.width !== grid[0].length || pixelArt.height !== grid.length) {
        setDimensions(grid[0].length, grid.length);
        setPixelArt((v) => ({...v, grid}));
      } else {
        for (let y = 0; y < grid.length; y++) {
          for (let x = 0; x < grid[y].length; x++) {
            paintPixel({ gridUID: pixelArt.uid, pos: { x, y } }, grid[y][x]);
          }
        }
      }
    },
    [paintPixel, pixelArt.height, pixelArt.uid, pixelArt.width, setDimensions]
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

  return [
    pixelArt,
    setPixelArt,
    {
      paintPixel,
      resetGrid,
      fillColumn,
      fillLine,
      fillGrid,
      applyGrid,
      setDimensions
    },
  ];
};

export default usePixelArt;
