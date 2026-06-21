import {calculateBarPercentage} from "../stockfish/stockfish.tsx";

function EvalBar(props: { percentageFill: number }) {
  const percentageFill = props.percentageFill;
  const isWhiteWinning = percentageFill > 0;
  return (
      <div className="evalBar flex flex-col items-center w-1/12 justify-center overflow-hidden ">
          <div className={`white bg-white w-full  ${isWhiteWinning ? "text-black" : "text-white"} flex justify-center items-start`}
               style={{ height: `${calculateBarPercentage(percentageFill).toPrecision(2)}%` }}
          >{percentageFill.toPrecision(4)}</div>
          <div
              className={`black bg-black w-full h-full bottom-0 ${isWhiteWinning ? "text-black" : "text-white"} flex justify-center items-end`}
          >{percentageFill.toPrecision(4)}</div>
      </div>
  );
}

export default EvalBar;
