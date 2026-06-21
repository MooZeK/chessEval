import { Chessboard, type ChessboardOptions } from "react-chessboard";
import {
  useStockfish,
  type EngineEvaluation,
  getAbsoluteWhiteScore,
} from "../stockfish/stockfish.tsx";
import { useCallback, useEffect, useState } from "react";
import EvalBar from "./evalBar.tsx";
import type { Chess } from "chess.js";

function ChessBoard(props: { chess: Chess }) {
  const activeColor = props.chess.turn();
  const position = props.chess.fen();
  const [evaluations, setEvaluations] = useState<EngineEvaluation[]>([]);

  const ChessBoardParams: ChessboardOptions = {
    position: props.chess.fen(),
  };

  const handleEvaluationUpdate = useCallback(
    (latestLines: EngineEvaluation[]) => {
      setEvaluations(latestLines);
    },
    [],
  );

  const { analyzePosition } = useStockfish({
    onEvaluationUpdate: handleEvaluationUpdate,
    multiPVCount: 3,
  });

  const analyzeOnLoad = useCallback(() => {
    analyzePosition(position);
  }, [position, analyzePosition]);

  useEffect(() => {
    analyzeOnLoad();
  }, [analyzeOnLoad]);

  const whiteScore = evaluations[0]
    ? getAbsoluteWhiteScore(evaluations[0], activeColor)
    : 0;

  return (
    <div className="chessBoard flex place-content-center space-around h-auto">
      <EvalBar percentageFill={whiteScore} />
      <div className={"w-1/3"}>
        <Chessboard options={ChessBoardParams} />
      </div>
      <div className={"Evals w-1/3"}>
        <ul>
          {evaluations.slice(0, 3).map((e, index) => (
            <li key={"line" + index}>{index + 1 + ". " + e.pv}</li>
          ))}
        </ul>
        <div className={"history bg-stone-300 overflow-scroll"}>
          {props.chess.history().map((move, index) => (
            <span key={"move" + index}>{move}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ChessBoard;
