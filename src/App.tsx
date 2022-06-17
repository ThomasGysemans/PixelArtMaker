import React, { useCallback, useRef, useState } from "react";
import usePixelArt, { createPNG, loadPNG } from "./lib/hooks/usePixelArt";
import PixelArtMaker from "./lib/PixelArtMaker";

const App: React.FC = () => {
  const [pixelArt, config, { paintPixel, registry, applyGrid }] = usePixelArt(16, 16, 25);
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
          return toggleColorPicker();
        }
      }
      paintPixel(data, color);
    },
    [doPickColor, paintPixel, color, toggleColorPicker]
  );

  return (
    <>
      <div>
        <PixelArtMaker
          config={config}
          model={pixelArt}
          onClick={onPixelClick}
          registry={registry}
        />
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
            loadPNG(fileInput, (grid: Grid) => {
              applyGrid(grid);
            });
          }}
        />
      </div>
    </>
  );
};

export default App;
