import { response, results } from "./App";
import { modelInfo } from "./model-info";

type resultsProps = { results: results }
const Results = ({ results }: resultsProps) => {
  if (!results) return;
  if (results === "client-failure") {
    <div className="bg-red-900 rounded-sm border border-red-700 shadow-md px-2.5 py-1">
      :( "Couldn't process your drawing"
    </div>
  }

  else return (
    <table className="animate-fade-in shadow-md border-separate border-neutral-600 border-[0.5px] rounded-sm border-spacing-0">
      <thead className="font-bold text-neutral-100">
        <tr>
          <th>Model Type</th>
          <th>Inference</th>
          <th>Confidence</th>
        </tr>
      </thead>
      <tbody className="text-neutral-300">
        {Object.keys(results).map((model, i) => <Row ind={i} key={model} model={model} value={results[model as keyof results]} />)}
      </tbody>
    </table>
  );
}

// Borders are styled in ./results-table.css
type rowProps = { model: string, value: response, ind: number };
const Row = ({ model, value, ind }: rowProps) => {
  const Loading = ({ delay }: { delay: number }) => <td>
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
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#ffffffde" viewBox="0 0 256 256">
          <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216ZM80,108a12,12,0,1,1,12,12A12,12,0,0,1,80,108Zm96,0a12,12,0,1,1-12-12A12,12,0,0,1,176,108Zm-1.08,64a8,8,0,1,1-13.84,8c-7.47-12.91-19.21-20-33.08-20s-25.61,7.1-33.08,20a8,8,0,1,1-13.84-8c10.29-17.79,27.39-28,46.92-28S164.63,154.2,174.92,172Z"></path>
        </svg>
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
      <ModelNameCell model={model} />
      {content}
    </tr>
  )
}

type modelNameCellProps = { model: string }
const ModelNameCell = ({ model }: modelNameCellProps) => {
  const description = modelInfo[model as keyof typeof modelInfo] || "Model info not found :(";
  return (
    <>
      <td className="underline decoration-dotted decoration-gray-500">
        <span className="group relative cursor-default">
          {model}
          <div className="absolute z-10 min-w-[19.5rem] sm:min-w-[30rem] max-w-md bg-neutral-900 px-3 py-1.5
            border rounded-lg shadow-lg border-neutral-600
            sm:translate-x-[-18%] translate-y-0.5
            bottom-7 sm:bottom-auto
            opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none
            text-justify"
          >
            {description}
          </div>
        </span>
      </td>
    </>
  );
}

export default Results