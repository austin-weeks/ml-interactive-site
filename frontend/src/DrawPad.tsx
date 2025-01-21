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
  const { onRequestImage, getClearCanvas } = context;

  function getImageData(): number[] {
    if (!state.current.ctx) {
      throw new Error("canvas context is not set");
    }
    // Preprocess the original drawing and center on original canvas
    centerAndResizeDigit(state.current.ctx);
    // Downsample the drawing to 28 x 28
    // Return drawing pixel array
    return downsampleAndGetPixelArray(state.current.ctx);
  }
  onRequestImage(getImageData)

  function clearCanvas() {
    if (!state.current.ctx) {
      return;
    }
    const width = state.current.ctx.canvas.width;
    const height = state.current.ctx.canvas.height;
    state.current.ctx.clearRect(0, 0, width, height);
  }
  getClearCanvas(clearCanvas);
  
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
    const canvasCtx = canvas.current.getContext("2d", {
      willReadFrequently: true
    });
    if (!canvasCtx) {
      console.log("no context");
      return;
    }
    state.current.ctx = canvasCtx;
    canvasCtx.imageSmoothingEnabled = false;

    const controller = new AbortController();
    const {signal} = controller;

    function getCoords(e: MouseEvent | TouchEvent): {offsetX: number, offsetY: number} {
      if (e instanceof TouchEvent) {
        const touch = e.touches[0] || e.changedTouches[0];
        const rect = canvas.current!.getBoundingClientRect();
        return {
          offsetX: touch.clientX - rect.left,
          offsetY: touch.clientY - rect.top
        }
      } else return {
        offsetX: e.offsetX,
        offsetY: e.offsetY
      }
    }
    
    function onPointerDown(e: MouseEvent | TouchEvent) {
      e.preventDefault();
      const {offsetX, offsetY} = getCoords(e);
      state.current.isDrawing = true;
      state.current.lastX = offsetX;
      state.current.lastY = offsetY;
    }
    
    function onMouseMove(e: MouseEvent | TouchEvent) {
      if (!state.current.isDrawing || !canvasCtx) return;
      e.preventDefault();
      const {offsetX, offsetY} = getCoords(e);
      
      canvasCtx.beginPath();
      canvasCtx.moveTo(state.current.lastX, state.current.lastY);
      canvasCtx.lineTo(offsetX, offsetY);
      canvasCtx.lineJoin = "round";
      canvasCtx.lineCap = "round";
      canvasCtx.strokeStyle = STROKE_COLOR;
      canvasCtx.lineWidth = STROKE_WIDTH;
      canvasCtx.stroke();
      canvasCtx.closePath();
      
      state.current.lastX = offsetX;
      state.current.lastY = offsetY;
    }
    
    function onDrawLeave(_: any) {
      state.current.isDrawing = false;
    }

    canvas.current.addEventListener("touchmove", onMouseMove, {signal, passive: false});
    canvas.current.addEventListener("touchstart", onPointerDown, {signal, passive: false});
    canvas.current.addEventListener("mousemove", onMouseMove, {signal});
    canvas.current.addEventListener("mousedown", onPointerDown, {signal});
    canvas.current.addEventListener("touchcancel", onDrawLeave, {signal});
    canvas.current.addEventListener("touchend", onDrawLeave, {signal})
    canvas.current.addEventListener("mouseup", onDrawLeave, {signal});
    canvas.current.addEventListener("mouseout", onDrawLeave, {signal});

    return () => {
      controller.abort();
    }
  }, [canvas]);

  return (
    <canvas ref={canvas} width={224} height={224}
      className="
        touch-none
        shadow-lg 
        border border-neutral-600 rounded-sm 
        bg-neutral-900
      "
    />
  )
}

export default DrawPad