import { createContext, useRef } from "react"
import DrawPad from "./DrawPad"

type appContext = {
  onRequestImage: (callback: () => number[] | null) => void
}

export const AppContext = createContext<appContext | null>(null);

function App() {
  const getImageCallback = useRef<any>(null);
  function onRequestImage(callback: () => number[] | null) {
    getImageCallback.current = callback;
  }
  function onSubmit() {
    if (!getImageCallback.current) {
      console.error("get image callback not registered");
      window.alert("cant do it");
      return;
    }
    const imageData = getImageCallback.current();
    console.log(imageData);
    // send to backend for processing
  }

  return (
    <AppContext.Provider value={{
      onRequestImage
    }}
    >
      <h1>How good is that model?</h1>
      <p className="text-center">
        Draw a single numerical digit (0-9) in the drawing pad, and see how different models interpret it!
      </p>
      <DrawPad />
      <button onClick={onSubmit}>Submit</button>
      <div className="flex flex-row gap-4">
        {/* <div>The model sees -&gt; </div> */}
        <div id="downsampled-root" />
      </div>
      {/* here be the results */}
    </AppContext.Provider>
  )
}

export default App
