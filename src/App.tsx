import React, { useCallback, useState } from "react";
import usePixelArt from "./lib/hooks/usePixelArt";
import PixelArtMaker from "./lib/PixelArtMaker";

const App: React.FC = () => {
  const [pixelArt, config, { paintPixel, registry }] = usePixelArt(16, 16, 25, 0xffffff);
  const [color] = useState<number>(0xff0000);

  const onPixelClick = useCallback(
    (data: PixelData) => {
      paintPixel(data, color);
    },
    [paintPixel, color]
  );

  /* useEffect(() => {
    const reference = fileInput.current;

    const handleFile = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const files = target.files;
      if (files && files.length > 0) {
        const file: File = files[0];
        console.log("file =", file);

        const reader = new FileReader();
        const grid: number[][] = [];
        reader.readAsArrayBuffer(file);
        reader.onloadend = function (evt: ProgressEvent<FileReader>) {
          if (evt.target!.readyState === FileReader.DONE) {
            const arrayBuffer = evt.target!.result as ArrayBuffer;
            const array = new Uint8Array(arrayBuffer);
            // applyGrid(grid);
          }
        };
      }
    };

    reference?.addEventListener("change", handleFile);

    return () => {
      reference?.removeEventListener("change", handleFile);
    };
  }, []); */

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

  return (
    <div>
      <PixelArtMaker config={config} model={pixelArt} onClick={onPixelClick} registry={registry} />
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
  );
};

export default App;
