/// <reference types="react-scripts" />

interface Pos {
  x: number;
  y: number;
}

interface PixelData {
  gridUID: string;
  pos: Pos;
  hexColor?: string | null;
}

interface PixelProps {
  x: number;
  y: number;
  size: number;
  color: string | null; // hexadecimal, null for transparent
  gridUID: string;
  onClick?: (data: PixelData) => void;
  onPixelDrawn?: () => void;
}

interface PixelArt {
  grid: Grid;
  uid: string;
  width: number;
  height: number;
  pxSize: number;
}

interface PixelArtInitialisation {
  grid: Grid;
  uid: string;
  width: number;
  height: number;
}

interface PixelArtRegistry {
  applyState: (index:number) => void;
  registerState: (grid:Grid, actionDescription:string, index?:number) => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  undo: () => void;
  redo: () => void;
  resetStatesOnCurrentOne: () => void;
}

interface RegistryState {
  grid: Grid;
  actionDescription: string;
}

type Grid = (string | null)[][];
