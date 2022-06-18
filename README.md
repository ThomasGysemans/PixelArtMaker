# PixelArtMaker

A way to draw textures pixel by pixel with React.

Project written in `TypeScript`.

This README is for version `0.0.1`. Breaking changes will happen.

## Getting started

This package is not available on any package manager such as npm. Therefore, you need to copy-paste the whole code in `lib` folder.

## How it works

Each grid is represented as an array of strings, each cell of the grid is one pixel and each pixel contains a value which is its hexadecimal color as a string :

```javascript
const grid: Grid = [
    ["ff0000", null, null, null],
    [null, "ff0000", null, null],
    [null, null, "ff0000", null],
    [null, null, null, "ff0000"],
]
```

This grid is a transparent picture of 4x4 with a red diagonal. We use `null` for transparent pixels.

For transparent colors, add 2 hexadecimals digits after the color. For example, a red color with 50% of opacity will be:

```typescript
const reddishColor: string = RGBToHex("rgba(255, 0, 0, 0.5)");
// reddishColor = "ff00007f"

// function RGBToHex = (rgb: string | number[]): string
```

There is a jsdoc for almost every function.

## How to create a grid

Use the component `PixelArtMaker` to allow modifications on the grid by the user:

```typescript jsx
import PixelArtMaker from "./lib/PixelArtMaker";
import usePixelArt from "./lib/hooks/usePixelArt";
import {useCallback} from "react";

export const myComponent = () => {
    // usePixelArt(width:number, height:number, pixelSize:number, initialColor?:string)
    // On this example, we'll generate a grid 16x16 where each "pixel" is a square of 25 pixels length (css side) entirely red.
    // By default, if no initial color is specified, the grid will be transparent
    const [pixelArt, setPixelArt, {paintPixel, registry}] = usePixelArt(16, 16, 25, "ff0000");
    const [doPickColor, setDoPickColor] = useState<boolean>(false);
    const [color, setColor] = useState<string>("ff0000");

    const toggleColorPicker = useCallback(() => {
        setDoPickColor((v) => !v);
    }, []);
    
    const onPixelClicked = useCallback((data:PixelData) => {
        // Create your own feature to pick the color from a pixel
        if (doPickColor) {
            if (data.hexColor) {
                setColor(data.hexColor);
                toggleColorPicker();
            }
            return;
        }
        paintPixel(data, color);
    }, []);
    
    return <div>
        <PixelArtMaker model={pixelArt} onClick={onPixelClicked} registry={registry} />
        <div>
            <button type="button" onClick={toggleColorPicker}>
                Toggle pick color ({doPickColor ? "on" : "off"})
            </button>
        </div>
    </div>
};
```

Here's a list of PixelArtMaker's props:

```typescript
interface PixelArtProps {
  model: PixelArt;
  onClick: (data: PixelData) => void;
  roundedGrid?: boolean;
  className?: string;
  registry?: PixelArtRegistry;
}
```

From the registry associated to a pixel art, you can use 4 public methods:

- `canUndo():boolean`
- `canRedo():boolean`
- `undo():void`
- `redo():void`
- `resetStatesOnCurrentOne():void`

To manipulate the grid, use the methods available via `usePixelArt` hook. Here is a list of the methods:

- `paintPixel: (pixelData: PixelData, newColor: string) => void`
- `resetGrid: () => void`
- `fillLine: (color: string, line: number) => void`
- `fillColumn: (color: string, column: number) => void`
- `fillGrid: (color: string) => void`
- `applyGrid: (grid: Grid) => void`
- `setDimensions: (
    width: number | null, 
    height: number | null, 
    callback?: (model: PixelArt) => void
  ) => void`

## Readonly grid

Use the component `GridView` with the following props:

```typescript
interface GridViewProps {
  model: PixelArt;
  roundedGrid?: boolean;
  className?: string;
  onLoad?: () => void;
}
```

## Best features

The whole point behind this project was to create two methods. One to load a PNG and read every pixel in order to display them on a grid inside the DOM, another to create a PNG from that group of divs.

Here's the methods to do that:

```typescript
function loadPNG(
    imageSrc:React.MutableRefObject<HTMLInputElement | null> | string,
    callback: (grid: Grid, width: number, height: number) => void
): void {
    // here the magic happens
};

function createPNG(pixelArt:PixelArt): void {
    // here the magic happens
    // the download of the PNG will start automatically
};
```

**NOTE**: you should use `loadPNG` like this:

```typescript jsx
const fileInput = useRef<HTMLInputElement | null>(null);

// ...

<input
  type="file"
  ref={fileInput}
  onChange={() => {
    loadPNG(fileInput, (grid: Grid, width: number, height: number) => {
      if (width !== pixelArt.width || height !== pixelArt.height) {
        setDimensions(width, height);
      }
      setPixelArt((v) => ({...v, grid}));
    });
  }}
/>
```

## Contributors

I'm far from being the best react developer out there, so I'd highly appreciate some help to improve performance.

## License


MIT License