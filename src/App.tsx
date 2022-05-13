import React, { useCallback, useState } from "react";
import usePixelArt from "./lib/hooks/usePixelArt";
import PixelArtMaker from "./lib/PixelArtMaker";

const App: React.FC = () => {
  const [pixelGrid, config, { paintPixel }] = usePixelArt(16, 16, 25, 0xffffff);
  const [color] = useState<number>(0xff0000);

  const onPixelClick = useCallback(
    (data: PixelData) => {
      paintPixel(data, color);
    },
    [paintPixel, color]
  );

  return (
    <div>
      <PixelArtMaker config={config} grid={pixelGrid} onClick={onPixelClick} />
    </div>
  );
};

export default App;
