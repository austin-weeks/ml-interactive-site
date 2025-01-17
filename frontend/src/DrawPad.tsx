import { useContext, useEffect, useRef } from "react"
import { AppContext } from "./App";

const STROKE_WIDTH = 16;
const STROKE_COLOR = "#FFFFFF";
const DOWNSAMPLED_SIZE = 28;

type canvasState = {
  isDrawing: boolean
  lastX: number
  lastY: number
  ctx: CanvasRenderingContext2D | null
}

const DrawPad = () => {
  const context = useContext(AppContext);
  if (!context) return;
  const { onRequestImage } = context;
  
  function getImageData(): number[] {
    if (!state.current.ctx) {
      throw new Error("canvas context is not set");
    }

    //Create a downsampled canvas
    let downsampledCanvas = document.getElementById("downsampled-canvas") as HTMLCanvasElement;
    if (!downsampledCanvas) {
      downsampledCanvas = document.createElement("canvas");
      downsampledCanvas.id = "downsampled-canvas";
      downsampledCanvas.width = DOWNSAMPLED_SIZE;
      downsampledCanvas.height = DOWNSAMPLED_SIZE;
      downsampledCanvas.classList.add("shadow-sm", "border", "border-neutral-600", "rounded-sm", "bg-neutral-900")
    }
    // document.getElementById("downsampled-root")?.append(downsampledCanvas);
    const downsampledCtx = downsampledCanvas.getContext("2d");
    if (!downsampledCtx) {
      throw new Error("could not get downsample canvas context");
    }
    // downsampledCtx.imageSmoothingEnabled = false;
    downsampledCtx.clearRect(0, 0, downsampledCanvas.width, downsampledCanvas.height);
    // Draw original canvas to downsampled canvas
    downsampledCtx.drawImage(state.current.ctx.canvas, 0, 0, DOWNSAMPLED_SIZE, DOWNSAMPLED_SIZE);
    state.current.ctx.imageSmoothingEnabled = false;
    state.current.ctx.clearRect(0, 0, state.current.ctx.canvas.width, state.current.ctx.canvas.height);
    state.current.ctx.drawImage(downsampledCtx.canvas, 0, 0, state.current.ctx.canvas.width, state.current.ctx.canvas.height);
    
    // Get Image data for downsampled canvas
    const {data, width, height} = downsampledCtx.getImageData(0, 0, DOWNSAMPLED_SIZE, DOWNSAMPLED_SIZE, {colorSpace: "srgb"});
    console.assert(width === height);
    const out: number[] = [];
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2], a =  data[i + 3];
      // Avg the values, divide by 255 to clamp from 0-1
      const value = ((r + g + b + a) / 4) / 255;
      out.push(value);
    }
    return out;
  }
  onRequestImage(() => getImageData())
  
  const canvas = useRef<HTMLCanvasElement>(null);
  const state = useRef<canvasState>({
    isDrawing: false,
    lastX: 0,
    lastY: 0,
    ctx: null
  });

  useEffect(() => {
    if (canvas.current === null) {
      console.log("no canvas");
      return;
    }
    if (state.current === null) {
      console.error("somehow state is null!");
      return;
    }

    const canvasCtx = canvas.current.getContext("2d");
    if (!canvasCtx) {
      console.log("no context");
      return;
    }
    state.current.ctx = canvasCtx;
    
    function onMouseDown(e: MouseEvent) {
      state.current.isDrawing = true;
      state.current.lastX = e.offsetX;
      state.current.lastY = e.offsetY;
    }
    canvas.current.addEventListener("mousedown", onMouseDown);

    function onMouseMove(e: MouseEvent) {
      if (!state.current.isDrawing || !canvasCtx) return;

      canvasCtx.beginPath();
      canvasCtx.moveTo(state.current.lastX, state.current.lastY);
      canvasCtx.lineTo(e.offsetX, e.offsetY);
      canvasCtx.lineJoin = "round";
      canvasCtx.lineCap = "round";
      canvasCtx.strokeStyle = STROKE_COLOR;
      canvasCtx.lineWidth = STROKE_WIDTH;
      canvasCtx.stroke();
      canvasCtx.closePath();
      
      state.current.lastX = e.offsetX;
      state.current.lastY = e.offsetY;
    }
    canvas.current.addEventListener("mousemove", onMouseMove);

    function onMouseLeave(_: any) {
      state.current.isDrawing = false;
    }
    canvas.current.addEventListener("mouseup", onMouseLeave);
    canvas.current.addEventListener("mouseout", onMouseLeave);
    return () => {
      if (!canvas.current) return;
      canvas.current.removeEventListener("mousedown", onMouseDown);
      canvas.current.removeEventListener("mousemove", onMouseMove);
      canvas.current.removeEventListener("mouseout", onMouseLeave);
      canvas.current.removeEventListener("mouseup", onMouseLeave);
    }
  }, [canvas]);

  return (
    <canvas ref={canvas} width={224} height={224}
      className="
        shadow-lg 
        border border-neutral-600 rounded-sm 
        bg-neutral-900
      "
    />
  )
}

export default DrawPad