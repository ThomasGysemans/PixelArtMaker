import {useCallback, useRef, useState} from "react";
import usePixelArt from "./lib/hooks/usePixelArt";
import PixelArtMaker from "./lib/PixelArtMaker";
import useRegistry from "./lib/hooks/useRegistry";
import createPNG from "./lib/utils/createPNG";
import loadPNG from "./lib/utils/loadPNG";
import RegistryActions from "./lib/utils/RegistryActions";

import type React from "react";

const App: React.FC = () => {
  const [pixelArt, setPixelArt, { paintPixel, applyGrid, setDimensions }] = usePixelArt(16, 16, 30);
  const registry = useRegistry(pixelArt.grid, applyGrid);
  const [doPickColor, setDoPickColor] = useState<boolean>(false);
  const [color, setColor] = useState<string>("ff0000");
  const fileInput = useRef<HTMLInputElement | null>(null);

  const toggleColorPicker = useCallback(() => {
    setDoPickColor((v) => !v);
  }, []);

  const onPixelClick = useCallback(
    (data: PixelData) => {
      if (doPickColor) {
        if (data.hexColor) {
          setColor(data.hexColor);
          toggleColorPicker();
        }
        return;
      }
      paintPixel(data, color);
    },
    [doPickColor, paintPixel, color, toggleColorPicker]
  );

  return (
    <>
      <div>
        <PixelArtMaker model={pixelArt} onClick={onPixelClick} registry={registry} />
        <div>
          <button
            onClick={() => {
              registry.undo();
            }}
          >
            Undo
          </button>
          <button
            onClick={() => {
              registry.redo();
            }}
          >
            Redo
          </button>
          <button
            type="button"
            onClick={() => {
              createPNG(pixelArt);
            }}
          >
            Download PNG
          </button>
          <button type="button" onClick={toggleColorPicker}>
            Toggle pick color ({doPickColor ? "on" : "off"})
          </button>
        </div>
      </div>
      <div>
        <input
          type="file"
          name="file"
          id="file"
          ref={fileInput}
          onChange={() => {
            loadPNG(fileInput, (grid: Grid, width: number, height: number) => {
              if (width !== pixelArt.width || height !== pixelArt.height) {
                setDimensions(width, height);
              }
              setPixelArt((v) => ({...v, grid}));
              registry.registerState(grid, RegistryActions.pngLoaded);
            });
          }}
        />
      </div>
    </>
  );
};

export default App;
