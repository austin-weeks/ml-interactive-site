import { createContext, useContext, useRef, useState } from "react"
import DrawPad from "./DrawPad"
import Spinner from "./Spinner";

const DEV = true;
const API_URL = "http://localhost:8080/models";

type inference = any
type serverStatus = null | "loading" | "failure" | inference

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
      setServerStatus("loading");
      if (DEV) await new Promise(resolve => setTimeout(resolve, 3000));
      const resp = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8"
        },
        body: JSON.stringify(imageData)
      });
      const json = await resp.json();
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
  else return (
    <div>
      {serverStatus}
    </div>
  );
}



export default App
