import { Chessboard } from "react-chessboard";
import EvalBar from "../components/chessboard/evalBar.tsx";
import {
  type EngineEvaluation,
  getAbsoluteWhiteScore,
} from "../components/stockfish/stockfish.tsx";
import Menu from "../components/Menu/Menu";
import { useChessContext } from "./ChessContext.tsx";

function App() {
  // stockfish settings from formDialog
  const { chessContextProps, chessboardOptions } = useChessContext();

  const getTopEval = () => {
    const topMove = chessContextProps.evaluation.find(
      (line: EngineEvaluation) => line.multipv === 1,
    );

    if (topMove) {
      return getAbsoluteWhiteScore(topMove, chessContextProps.turn);
    }
    return 0;
  };

  return (
    <div className="App flex items-center justify-center h-screen bg-stone-800">
      <EvalBar percentageFill={getTopEval()} />
      <Chessboard options={chessboardOptions} />
      <Menu />
    </div>
  );
}

export default App;
