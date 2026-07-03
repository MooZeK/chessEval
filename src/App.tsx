import { Chessboard, type ChessboardOptions } from "react-chessboard";
import EvalBar from "../components/chessboard/evalBar.tsx";
import { Chess } from "chess.js";
import {useCallback, useState} from "react";
import {
  PositionInputDialog,
  FEN_PATTERN,
  PGN_PATTERN,
} from "../components/positionInputDialog/positionInputDialog.tsx";
import { SettingsDialog } from "../components/SettingsDialog/SettingDialog.tsx";
import { useStockfish, type EngineEvaluation, getAbsoluteWhiteScore, calculateBarPercentage } from "../components/stockfish/stockfish.tsx";
import z from "zod";

function App() {
  const [chess, setChess] = useState<Chess>(new Chess());
  const [evaluations, setEvaluations] = useState<EngineEvaluation[]>([]);
  const [activeColor, setActiveColor] = useState<"w" | "b">("w");

  // stockfish settings from formDialog
  const [stockfishVersion, setStockfishVersion] = useState("");
  const [stockfishLinesNumber, setStockfishLinesNumber] = useState(3);
  const [stockfishMaxTime, setStockfishMaxTime] = useState(3000); // in milliseconds


  const ChessboardParams: ChessboardOptions = {
    position: chess.fen(),
  };

  const { analyzePosition } = useStockfish({
    multiPVCount: stockfishLinesNumber, // Show top 3 variations
    stockfishVersion: stockfishVersion,
    onEvaluationUpdate: (latestLines) => {
      setEvaluations(latestLines);
    },
  });
  const handleSettingsChange = (
    stockfishVersion: string,
    stockfishMaxTime: number,
    stockfishLinesNumber:number,
  ) => {
    setStockfishVersion(stockfishVersion);
    setStockfishMaxTime(stockfishMaxTime);
    setStockfishLinesNumber(stockfishLinesNumber);
    return;
  };

  const handleEvaluationUpdate = (currentFen: string)=>{
    analyzePosition(currentFen, stockfishMaxTime);
  }

  const handleChessGameInput = (value: string) => {
    const newChess = new Chess();

    const FENresult = z.string().regex(FEN_PATTERN).safeParse(value);

    if (FENresult.success) {
      newChess.load(value);
      setChess(newChess);
      return;
    }

    const PGNresult = z.string().regex(PGN_PATTERN).safeParse(value);

    if (PGNresult.success) {
      newChess.loadPgn(value);
      setChess(newChess);
      return;
    }
  };

  useCallback(()=>{
    setActiveColor(chess.turn);
    handleEvaluationUpdate(chess.fen())
  },[chess])

  const getTopEval = ()=>{
    const topMove = evaluations.find((line) => line.multipv === 1);

    if (topMove) {
      const whiteScore = getAbsoluteWhiteScore(topMove, activeColor);
      return calculateBarPercentage(whiteScore);
    }
    return 50
  }

  return (
    <div className="App flex items-center justify-center h-screen bg-stone-800">
      <EvalBar percentageFill={getTopEval()} />
      <div className="w-1/3">
        <Chessboard options={ChessboardParams} />
      </div>
      <PositionInputDialog chessPositionSetter={handleChessGameInput} />
      <SettingsDialog settingsSetter={handleSettingsChange} />
    </div>
  );
}
export default App;
