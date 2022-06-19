/**
 * Creates a PNG image from the grid of `pixelArt`
 * @param {PixelArt} pixelArt the pixel art that contains the grid.
 * @param {boolean} startDownloadAutomatically whether to start the download automatically or not.
 * @param {string} fileName the default name of the file (to use only if `startDownloadAutomatically` is set to true).
 * @returns {string} the data URL used to generate the PNG file.
 */
const createPNG = (pixelArt: PixelArt, startDownloadAutomatically:boolean = true, fileName:string = "pixelart"):string => {
    // Drawn the image based on the hexadecimal colors
    const canvas = document.createElement("canvas");
    canvas.width = pixelArt.width;
    canvas.height = pixelArt.height;
    const context = canvas.getContext("2d");
    if (context) {
        const pixSize = 1;
        for (let i = 0; i < pixelArt.grid.length; i++) {
            let col = pixelArt.grid[i];
            for (let j = 0; j < col.length; j++) {
                if (col[j] === null) {
                    continue;
                }
                context.fillStyle = "#" + col[j]; // #hex format
                context.fillRect(j * pixSize, i * pixSize, pixSize, pixSize);
            }
        }
    }
    // Get the URL
    const dataURL = canvas.toDataURL("image/png", 1.0);
    // Download
    if (startDownloadAutomatically) {
        const anchor = document.createElement("a");
        anchor.setAttribute("href", dataURL);
        anchor.setAttribute("download", fileName);
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
    }
    return dataURL;
};

export default createPNG;