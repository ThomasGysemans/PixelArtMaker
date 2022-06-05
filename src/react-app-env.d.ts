/// <reference types="react-scripts" />

interface PixelArtConfig {
  width: number;
  height: number;
  pxSize: number;
  initialColor?: number;
  gridUID: string;
}

interface Pos {
  x: number;
  y: number;
}

interface PixelData {
  gridUID: string;
  pos: Pos;
  hexColor?: string;
}

interface PixelProps {
  x: number;
  y: number;
  size: number;
  color: number; // hexadecimal
  gridUID: string;
  onClick: (data: PixelData) => void;
  onPixelDrawn: () => void;
}

interface PixelArt {
  grid: Grid;
  uid: string;
}

interface RegistryState {
  grid: Grid;
  actionDescription: string;
}

type Grid = number[][];
