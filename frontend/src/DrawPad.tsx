import { useContext, useEffect, useRef } from "react"
import { AppContext } from "./App"
import { centerAndResizeDigit, downsampleAndGetPixelArray } from "./preprocessCanvas";

const STROKE_WIDTH = 14;
const STROKE_COLOR = "#FFFFFF";

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


    state.current.ctx.imageSmoothingEnabled = false;
    // Preprocess the original drawing and center on original canvas
    centerAndResizeDigit(state.current.ctx);
    // Downsample the drawing to 28 x 28
    // Return drawing pixel array
    return downsampleAndGetPixelArray(state.current.ctx);
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