import React from "react";

interface PixelArtBarProps {
  backgroundColor?: string;
}

const PixelArtConfigBar: React.FC<PixelArtBarProps> = ({ backgroundColor = "white" }) => {
  return <div className="pxm-bar" style={{ backgroundColor: backgroundColor }}></div>;
};

export default PixelArtConfigBar;
