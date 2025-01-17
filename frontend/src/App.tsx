import { createContext, useContext, useRef, useState } from "react"
import DrawPad from "./DrawPad"
import Spinner from "./Spinner";
import "./results-table.css"

const API_URL = "http://localhost:8080/models";

const MOCK_DATA = {
  results: [
    {
      model_name: "model 1",
      inference: 1,
      confidence: 0.5
    },
    {
      model_name: "model 2",
      inference: 2,
      confidence: 0.9
    }
  ]
}

type results = {
  results: inference[]
}
type inference = {
  model_name: string
  inference: number
  confidence: number
}
type serverStatus = null | "loading" | "failure" | results

type appContext = {
  onRequestImage: (callback: () => number[]) => void
  serverStatus: serverStatus
}

export const AppContext = createContext<appContext | null>(null);

const App = () => {
  const [serverStatus, setServerStatus] = useState<serverStatus>(null);

  const getImageCallback = useRef<() => number[]>();
  function onRequestImage(callback: () => number[]) {
    getImageCallback.current = callback;
  }
  async function onSubmit() {
    if (!getImageCallback.current) {
      console.error("get image callback not registered");
      window.alert("cant do it");
      return;
    }
    setServerStatus("loading");

    let imageData;
    try {
      imageData = getImageCallback.current();
    } catch (e) {
      console.error(e);
      setServerStatus("failure");
      return;
    }
    // send to backend for processing
    try {
      const resp = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8"
        },
        body: JSON.stringify({
          "image_data": imageData
        })
      });
      const json = await resp.json() as results;
      setServerStatus(json);
    } catch (e) {
      console.error(e);
      setServerStatus("failure");
    }
  }

  return (
    <AppContext.Provider value={{
      onRequestImage,
      serverStatus
    }}
    >
      <h1>How good is that model?</h1>
      <p className="text-center">
        Draw a single numerical digit (0-9) in the drawing pad, and see how different models interpret it!
      </p>
      <DrawPad />
      {!serverStatus && <button onClick={onSubmit}>Submit</button>}
      <Results />
    </AppContext.Provider>
  )
}

const Results = () => {
  const context = useContext(AppContext);
  if (!context) return;
  const { serverStatus } = context;
  if (!serverStatus) return;
  if (serverStatus == "failure") return (
    <div className="bg-red-900 rounded-sm border border-red-700 shadow-md px-2.5 py-1">
      :( Couldn't Get Response from Server
    </div>
  );
  if (serverStatus == "loading") return (
    <div
      className="
        bg-cyan-900 rounded-sm border border-cyan-700 shadow-md px-2 py-1
        flex flex-row gap-2 items-center justify-center
      "
    >
      <Spinner />
      Waiting for robots 🤖
    </div>
  );

  // Return table with results
  // Borders are styled in ./results-table.css
  else return (
    <table className="border-separate border-neutral-600 border-[0.5px] rounded-sm border-spacing-0">
      <thead className="font-bold text-neutral-100">
        <tr className="gap-">
          <th>Model Type</th>
          <th>Inference</th>
          <th>Confidence</th>
        </tr>
      </thead>
      <tbody className="text-neutral-300">
        {serverStatus.results.map(result => (
          <tr key={result.model_name}>
            <td>{result.model_name}</td>
            <td>{result.inference}</td>
            <td>{result.confidence}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}



export default App
