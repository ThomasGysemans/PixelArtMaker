import RGBToHex from "../utils/RGBToHex";
import type React from "react";

/**
 * Loads a PNG file from a local path, an url or an input file.
 * @param imageSrc This can be the reference to the input element of type file, or a string.
 * @param callback A callback that will give the new grid, the width of the image and the height of the image.
 */
const loadPNG = (
    imageSrc: React.MutableRefObject<HTMLInputElement | null> | string,
    callback: (grid: Grid, width: number, height: number) => void,
): void => {
    const image = new Image();
    if (typeof imageSrc !== "string") {
        if (imageSrc.current == null) return;
        if (imageSrc.current.files == null) return;
        if (imageSrc.current.files[0] == null) return;
        image.src = URL.createObjectURL(imageSrc.current!.files![0]);
    } else {
        image.src = imageSrc;
    }
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
            let grid: Grid = [];
            for (let y = 0; y < imageData.height; y++) {
                grid[y] = [];
                for (let px = 0; px < imageData.width; px++) {
                    const pixelIndex = y * imageData.width + px;
                    const pixel = getPixel(imageData, pixelIndex);
                    grid[y][px] = pixel[3] === 0 ? null : RGBToHex(pixel);
                }
            }
            callback(grid, image.width, image.height);
        }
    };
};

export default loadPNG;