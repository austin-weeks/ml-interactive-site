export function centerAndResizeDigit(ctx: CanvasRenderingContext2D) {
  const canvasWidth = ctx.canvas.width, canvasHeight = ctx.canvas.height;
  const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
  const data = imageData.data;

  // find the bounding box
  let minX = canvasWidth, maxX = 0;
  let minY = canvasHeight, maxY = 0;
  for (let y = 0; y < canvasHeight; y++) {
    for (let x = 0; x < canvasWidth; x++) {
      const i = (y * canvasWidth + x) * 4;
      // check alpha channel to see if anything is drawn on this pixel
      if (data[i + 3] > 0) {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    }
  }

  const imageWidth = maxX - minX;
  const imageHeight = maxY - minY;

  const paddingFactor = 0.7; // what percent of the canvas should the image fill
  const scale = Math.min(canvasWidth / imageWidth, canvasHeight / imageHeight) * paddingFactor;

  const newWidth = imageWidth * scale;
  const newHeight = imageHeight * scale;
  const offsetX = (canvasWidth - newWidth) / 2;
  const offsetY = (canvasHeight - newHeight) / 2;

  const resizeCanvas = document.createElement("canvas");
  resizeCanvas.width = canvasWidth;
  resizeCanvas.height = canvasHeight;
  const resizeCtx = resizeCanvas.getContext("2d");
  if (!resizeCtx) {
    throw new Error("couldnt get resize canvas context");
  }
  resizeCtx.putImageData(imageData, -minX, -minY);
  // Place resized image in original canvas
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  ctx.drawImage(resizeCanvas, 0, 0, imageWidth, imageHeight, offsetX, offsetY, newWidth, newHeight);
}

const DOWNSAMPLED_SIZE = 28;
export function downsampleAndGetPixelArray(ctx: CanvasRenderingContext2D): number[] {
  const downsampledCanvas = document.createElement("canvas");
  downsampledCanvas.width = DOWNSAMPLED_SIZE;
  downsampledCanvas.height = DOWNSAMPLED_SIZE;
  const downsampledCtx = downsampledCanvas.getContext("2d");
  if (!downsampledCtx) {
    throw new Error("could not get downsample canvas context");
  }
  downsampledCtx.drawImage(ctx.canvas, 0, 0, DOWNSAMPLED_SIZE, DOWNSAMPLED_SIZE);
  //Draw resized image back to original canvas
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.drawImage(downsampledCtx.canvas, 0, 0, ctx.canvas.width, ctx.canvas.height);
  const data = downsampledCtx.getImageData(0, 0, DOWNSAMPLED_SIZE, DOWNSAMPLED_SIZE, { colorSpace: "srgb" }).data;
  const out: number[] = [];
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
    // Avg the values, divide by 255 to clamp from 0-1
    const value = ((r + g + b + a) / 4) / 255;
    out.push(value);
  }
  if (out.length != 28 * 28) {
    throw new Error("output pixel array not of correct size");
  }
  return out;
}