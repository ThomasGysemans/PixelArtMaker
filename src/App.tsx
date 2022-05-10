import React, { useCallback } from "react";
import usePixelArt from "./lib/hooks/usePixelArt";
import PixelArtConfigBar from "./lib/PixelArtConfigBar";
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
      <PixelArtMaker
        config={config}
        attachConfigBar={true}
        roundedGrid={true}
        grid={pixelGrid}
        onClick={onPixelClick}
      >
        <PixelArtConfigBar />
      </PixelArtMaker>
    </div>
  );
};

export default App;
