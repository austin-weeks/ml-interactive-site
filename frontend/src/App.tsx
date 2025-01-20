import { createContext, useRef, useState } from "react"
import DrawPad from "./DrawPad"
import "./results-table.css"

const API_URL = "http://localhost:8080/models";

const MODELS = [
  "Basic Neural Net",
  "LeNet-5",
  "Advanced CNN"
]

type inference = {
  inference: number
  confidence: number
}
type response = "loading" | "server-failure" | inference
type results = {
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
    <AppContext.Provider value={{
      onRequestImage,
      getClearCanvas
    }}
    >
      <h1>How good is that model?</h1>
      <p className="text-center pt-2 pb-3">
        Click and drag to draw single numerical digit (0-9) on the drawing pad. <br />
        Hit submit to see the models' guesses!
      </p>
      <DrawPad />
      <div className=" py-2 flex flex-row justify-between w-[226px]">
        <button 
          className="flex flex-row gap-1 justify-center items-center
            hover:bg-neutral-900 active:bg-neutral-950 transition-colors"
          onClick={onSubmit}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="#ffffffde" viewBox="0 0 256 256"><path d="M200,48H136V16a8,8,0,0,0-16,0V48H56A32,32,0,0,0,24,80V192a32,32,0,0,0,32,32H200a32,32,0,0,0,32-32V80A32,32,0,0,0,200,48Zm16,144a16,16,0,0,1-16,16H56a16,16,0,0,1-16-16V80A16,16,0,0,1,56,64H200a16,16,0,0,1,16,16Zm-52-56H92a28,28,0,0,0,0,56h72a28,28,0,0,0,0-56Zm-24,16v24H116V152ZM80,164a12,12,0,0,1,12-12h8v24H92A12,12,0,0,1,80,164Zm84,12h-8V152h8a12,12,0,0,1,0,24ZM72,108a12,12,0,1,1,12,12A12,12,0,0,1,72,108Zm88,0a12,12,0,1,1,12,12A12,12,0,0,1,160,108Z"></path></svg>
          Submit
        </button>
        <button 
          className="flex flex-row gap-1 justify-center items-center
            hover:bg-neutral-900 active:bg-neutral-950 transition-colors"
          onClick={onClearCanvas}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="#ffffffde" viewBox="0 0 256 256"><path d="M225,80.4,183.6,39a24,24,0,0,0-33.94,0L31,157.66a24,24,0,0,0,0,33.94l30.06,30.06A8,8,0,0,0,66.74,224H216a8,8,0,0,0,0-16h-84.7L225,114.34A24,24,0,0,0,225,80.4ZM108.68,208H70.05L42.33,180.28a8,8,0,0,1,0-11.31L96,115.31,148.69,168Zm105-105L160,156.69,107.31,104,161,50.34a8,8,0,0,1,11.32,0l41.38,41.38a8,8,0,0,1,0,11.31Z"></path></svg>
          Clear
        </button>
      </div>
      <Results results={results} />
    </AppContext.Provider>
  )
}

const Results = ({ results }: {results: results}) => {
  if (!results) return;
  if (results === "client-failure") {
    <div className="bg-red-900 rounded-sm border border-red-700 shadow-md px-2.5 py-1">
      :( "Couldn't process your drawing"
    </div>
  }
  
  else return (
    <table className="animate-fade-in border-separate border-neutral-600 border-[0.5px] rounded-sm border-spacing-0">
      <thead className="font-bold text-neutral-100">
        <tr>
          <th>Model Type</th>
          <th>Inference</th>
          <th>Confidence</th>
        </tr>
      </thead>
      <tbody className="text-neutral-300">
        {Object.keys(results).map((model, i) => <Row ind={i} key={model} model={model} value={results[model as keyof results]}/>)}
      </tbody>
    </table>
  );
}

// Borders are styled in ./results-table.css
type rowProps = { model: string, value: response, ind: number};
const Row = ({ model, value, ind }: rowProps) => {

  const Loading = ({ delay }: {delay: number}) => <td>
    <div
      className="w-full h-[12px] bg-neutral-600 rounded-md animate-pulse"
      style={{ animationDelay: `${delay}s` }}
    />
  </td>

  let content;
  if (value == "loading") content = (
    <>
      <Loading delay={ind * 0.2} />
      <Loading delay={ind * 0.2 + 0.15} />
    </>
  )
  else if (value == "server-failure") content = (
    <td colSpan={2}>
      <div className="rounded-md h-[23px] bg-red-900 border border-red-800 flex flex-row justify-center items-center gap-2">
        Server Error
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#ffffffde" viewBox="0 0 256 256"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216ZM80,108a12,12,0,1,1,12,12A12,12,0,0,1,80,108Zm96,0a12,12,0,1,1-12-12A12,12,0,0,1,176,108Zm-1.08,64a8,8,0,1,1-13.84,8c-7.47-12.91-19.21-20-33.08-20s-25.61,7.1-33.08,20a8,8,0,1,1-13.84-8c10.29-17.79,27.39-28,46.92-28S164.63,154.2,174.92,172Z"></path></svg>
      </div>
    </td>
  )
  else content = (
    <>
      <td className="font-bold">{value.inference}</td>
      <td>{(value.confidence * 100).toFixed(0)}%</td>
    </>
  )
  return (
    <tr key={model}>
      <td>{model}</td>
      {content}
    </tr>
  )
}

export default App
