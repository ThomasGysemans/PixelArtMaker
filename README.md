# PixelArtMaker

A way to draw textures pixel by pixel with React.

Project written in `TypeScript`.

This README is for version `1.0.0`. Breaking changes may happen.

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
import RGBToHex from "./lib/utils/RGBToHex";

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
import useRegistry from "./lib/hooks/useRegistry";
import {useCallback} from "react";

export const myComponent = () => {
    // usePixelArt(width:number, height:number, pixelSize:number, initialColor?:string)
    // On this example, we'll generate a grid 16x16 where each "pixel" is a square of 25 pixels length (css side) entirely red.
    // By default, if no initial color is specified, the grid will be transparent
    const [pixelArt, setPixelArt, {paintPixel, applyGrid}] = usePixelArt(16, 16, 25, "00ff00");
    const registry = useRegistry(pixelArt.grid, applyGrid);
    const [doPickColor, setDoPickColor] = useState<boolean>(false);
    const [color, setColor] = useState<string>("ff0000");

    const toggleColorPicker = useCallback(() => {
        setDoPickColor((v) => !v);
    }, []);

    const onPixelClicked = useCallback((data: PixelData) => {
        // Create your own feature to pick the color from a pixel
        if (doPickColor) {
            if (data.hexColor) {
                setColor(data.hexColor);
                toggleColorPicker();
            }
            return;
        }
        paintPixel(data, color);
    }, [color, doPickColor, paintPixel, toggleColorPicker]);

    return <div>
        <PixelArtMaker model={pixelArt} onClick={onPixelClicked} registry={registry}/>
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

From the registry associated to a pixel art (which is not mandatory), you can use 5 methods:

- `registerState(grid:Grid, actionDescription:string, index?:number):void`
- `canUndo():boolean`
- `canRedo():boolean`
- `undo():void`
- `redo():void`
- `resetStatesOnCurrentOne():void`

Each state of the registry needs a description from `RegistryActions`:

```typescript
// default import from lib/utils/RegistryActions.ts
class RegistryActions {
    public static readonly drawnPixel = "drawn pixel";
    public static readonly fillGrid = "filled grid";
    public static readonly fillLine = "filled line";
    public static readonly fillColumn = "filled column";
    public static readonly reset = "reset grid";
    public static readonly init = "init grid";
    public static readonly multipleDrawnPixels = "multiple drawn pixels";
    public static readonly pngLoaded = "png was loaded";
}
```

To manipulate the grid, use the methods available via `usePixelArt` hook. Here is a list of the methods:

- `paintPixel: (pixelData: PixelData, newColor: string) => void`
- `resetGrid: () => void`
- `fillLine: (color: string, line: number) => void`
- `fillColumn: (color: string, column: number) => void`
- `fillGrid: (color: string) => void`
- `applyGrid: (grid: Grid) => void`
- `setDimensions: (
    width: number | null, 
    height: number | null
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
// default import from lib/utils/loadPNG
function loadPNG(
    imageSrc:React.MutableRefObject<HTMLInputElement | null> | string,
    callback: (grid: Grid, width: number, height: number) => void
): void {
    // here the magic happens...
    // the loading of the image takes time so we must use a callback.
};

// default import from lib/utils/createPNG
function createPNG(
    pixelArt:PixelArt,
    startDownloadAutomatically:boolean = true,
    fileName:string = "pixelart"
): string {
    // here the magic happens...
    // it will return the data URL used for the download
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
      // In case the imported image does not match the width and height of the grid
      // we can change the dimensions of the grid with `setDimensions(width:number|null, height:number|null):void`  
      if (width !== pixelArt.width || height !== pixelArt.height) {
        setDimensions(width, height);
      }
      // You must apply the new grid via setPixelArt() to ensure the changes will be applied on your whole component.
      setPixelArt((v) => ({...v, grid}));
      // if you `useRegistry`
      registry.registerState(grid, RegistryActions.pngLoaded);
    });
  }}
/>
```

## Contributors

I'm far from being the best react developer out there, so I'd highly appreciate some help to improve performance.

## License

MIT License