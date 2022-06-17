/// <reference types="react-scripts" />

interface PixelArtConfig {
  width: number;
  height: number;
  pxSize: number;
  initialColor?: string;
  gridUID: string;
}

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
  color: string | null; // hexadecimal
  gridUID: string;
  onClick: (data: PixelData) => void;
  onPixelDrawn: () => void;
}

interface PixelArt {
  grid: Grid;
  uid: string;
  width: number;
  height: number;
}

interface RegistryState {
  grid: Grid;
  actionDescription: string;
}

type Grid = (string | null)[][];
