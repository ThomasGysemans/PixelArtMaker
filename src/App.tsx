import React, { useCallback, useRef, useState } from "react";
import usePixelArt, { RGBToHex } from "./lib/hooks/usePixelArt";
import PixelArtMaker from "./lib/PixelArtMaker";

const App: React.FC = () => {
  const [pixelArt, config, { paintPixel, registry, applyGrid }] = usePixelArt(16, 16, 25, 0xffffff);
  const [color] = useState<number>(0xff0000);
  const fileInput = useRef<HTMLInputElement | null>(null);

  const onPixelClick = useCallback(
    (data: PixelData) => {
      paintPixel(data, color);
    },
    [paintPixel, color]
  );

  const createPNG = useCallback(() => {
    // Drawn the image based on the hexadecimal colors
    const canvas = document.createElement("canvas");
    canvas.width = 16;
    canvas.height = 16;
    const context = canvas.getContext("2d");
    if (context) {
      const pixSize = 1;
      for (var i = 0; i < pixelArt.grid.length; i++) {
        var col = pixelArt.grid[i];
        for (var j = 0; j < col.length; j++) {
          context.fillStyle = "#" + col[j].toString(16); // #hex format
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
  }, [pixelArt.grid]);

  // Called onChange for input:file
  const loadPNG = useCallback(() => {
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
        let grid: number[][] = [];
        for (let y = 0; y < imageData.height; y++) {
          grid[y] = [];
          for (let px = 0; px < imageData.width; px++) {
            let pixelIndex = y * imageData.width + px;
            grid[y][px] = RGBToHex(getPixel(imageData, pixelIndex));
          }
        }
        applyGrid(grid);
      }
    };
  }, [applyGrid]);

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
          <button type="button" onClick={createPNG}>
            Download PNG
          </button>
        </div>
      </div>
      <div>
        <input type="file" name="file" id="file" ref={fileInput} onChange={loadPNG} />
      </div>
      <canvas id="canvas"></canvas>
    </>
  );
};

export default App;
