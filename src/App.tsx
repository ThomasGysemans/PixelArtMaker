import React, { useCallback } from "react";
import usePixelArt from "./lib/hooks/usePixelArt";
import PixelArtMaker from "./lib/PixelArtMaker";

const App: React.FC = () => {
  const [pixelGrid, config, paintPixel] = usePixelArt(16, 16, 25, 0xffffff);

  const onPixelClick = useCallback(
    (data: PixelData) => {
      paintPixel(data, 0xff0000);
    },
    [paintPixel]
  );

  return (
    <div>
      <PixelArtMaker config={config} grid={pixelGrid} onClick={onPixelClick} />
    </div>
  );
};

export default App;
