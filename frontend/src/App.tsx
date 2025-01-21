import { createContext, useRef, useState } from "react"
import DrawPad from "./DrawPad"
import "./results-table.css"
import Results from "./ResultsTable";

const API_URL = window.location.href.includes("github.io") ? "https://model-server-1020153738308.us-central1.run.app/models" : "http://localhost:8080/models";

const MODELS = [
  "Basic Neural Net",
  "LeNet-5",
  "Advanced CNN"
]

type inference = {
  inference: number
  confidence: number
}
export type response = "loading" | "server-failure" | inference
export type results = {
  "Basic Neural Net": response
  "LeNet-5": response
  "Advanced CNN": response
} | null | "client-failure"

type appContext = {
  onRequestImage: (callback: () => number[]) => void
  getClearCanvas: (callback: () => void) => void
}
export const AppContext = createContext<appContext | null>(null);

const App = () => {
  const [results, updateResults] = useState<results>(null);

  const getImageCallback = useRef<() => number[]>();
  function onRequestImage(callback: () => number[]) {
    getImageCallback.current = callback;
  }
  const clearCanvasCallback = useRef<() => void>();
  function getClearCanvas(callback: () => void) {
    clearCanvasCallback.current = callback;
  }

  async function onSubmit() {
    if (!getImageCallback.current) {
      console.error("get image callback not registered");
      window.alert("cant do it");
      return;
    }
    updateResults({
      "Basic Neural Net": "loading",
      "LeNet-5": "loading",
      "Advanced CNN": "loading"
    });

    let imageJSON;
    try {
      const imageData = getImageCallback.current();
      imageJSON = JSON.stringify({
        "image_data": imageData
      })
    } catch (e) {
      console.error(e);
      updateResults("client-failure");
      return;
    }
    // send to backend for processing
    const requests = [];
    for (const model of MODELS) {
      const req = fetch(`${API_URL}/${model}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8"
        },
        body: imageJSON
      })
      .then(response => response.json())
      .then(json => {
        if (json.error) {
          throw new Error(json.error);
        }
        updateResults(prev => {
          if (!prev || prev === "client-failure") return prev;
          const next = {...prev};
          next[model as keyof typeof next] = {
            inference: json.inference,
            confidence: json.confidence
          }
          return next;
        })
      })
      .catch(e => {
        console.error(e);
        updateResults(prev => {
          if (!prev || prev === "client-failure") return prev;
          const next = {...prev};
          next[model as keyof typeof next] = "server-failure";
          return next;
        })
      });
      requests.push(req);
    }
    await Promise.all(requests);
  }

  function onClearCanvas() {
    if (!clearCanvasCallback.current) {
      return;
    }
    clearCanvasCallback.current();
  }

  return (
    <AppContext.Provider value={{onRequestImage, getClearCanvas}}>
      <div className="flex flex-col items-center">
        <h1 className="font-serif italic text-center text-5xl sm:text-[3.2rem] font-semibold">How good is that model?</h1>
        <p className="text-center pt-2 pb-3 text-sm sm:text-lg">
          Click and drag to draw a single numerical digit (0-9). <br/>
          Hit submit to see the models' guesses!
        </p>
        <DrawPad />
        <div className=" py-2 flex flex-row justify-between w-[226px]">
          <button 
            className="flex flex-row gap-1 justify-center items-center rounded-lg border border-neutral-600 shadow-md
            hover:bg-neutral-900 active:bg-neutral-950 transition-colors"
            onClick={onSubmit}
            >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="#ffffffde" viewBox="0 0 256 256"><path d="M200,48H136V16a8,8,0,0,0-16,0V48H56A32,32,0,0,0,24,80V192a32,32,0,0,0,32,32H200a32,32,0,0,0,32-32V80A32,32,0,0,0,200,48Zm16,144a16,16,0,0,1-16,16H56a16,16,0,0,1-16-16V80A16,16,0,0,1,56,64H200a16,16,0,0,1,16,16Zm-52-56H92a28,28,0,0,0,0,56h72a28,28,0,0,0,0-56Zm-24,16v24H116V152ZM80,164a12,12,0,0,1,12-12h8v24H92A12,12,0,0,1,80,164Zm84,12h-8V152h8a12,12,0,0,1,0,24ZM72,108a12,12,0,1,1,12,12A12,12,0,0,1,72,108Zm88,0a12,12,0,1,1,12,12A12,12,0,0,1,160,108Z"></path></svg>
            Submit
          </button>
          <button 
            className="flex flex-row gap-1 justify-center items-center rounded-lg border border-neutral-600 shadow-md
            hover:bg-neutral-900 active:bg-neutral-950 transition-colors"
            onClick={onClearCanvas}
            >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="#ffffffde" viewBox="0 0 256 256"><path d="M225,80.4,183.6,39a24,24,0,0,0-33.94,0L31,157.66a24,24,0,0,0,0,33.94l30.06,30.06A8,8,0,0,0,66.74,224H216a8,8,0,0,0,0-16h-84.7L225,114.34A24,24,0,0,0,225,80.4ZM108.68,208H70.05L42.33,180.28a8,8,0,0,1,0-11.31L96,115.31,148.69,168Zm105-105L160,156.69,107.31,104,161,50.34a8,8,0,0,1,11.32,0l41.38,41.38a8,8,0,0,1,0,11.31Z"></path></svg>
            Clear
          </button>
        </div>
        <Results results={results} />
      </div>
      <div className="text-neutral-400">
        made by <a className="transition-colors text-neutral-500 hover:text-neutral-600" href="https://austinweeks.dev">austin weeks</a>
      </div>
    </AppContext.Provider>
  )
}

export default App