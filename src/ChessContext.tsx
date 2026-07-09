import {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Chess, DEFAULT_POSITION, type Move } from "chess.js";
import {
  type EngineEvaluation,
  useStockfish,
} from "../components/stockfish/stockfish.tsx";
import type { ChessboardOptions } from "react-chessboard";

const ChessContext = createContext<ChessContextType | undefined>(undefined);

interface ChessContextType {
  chessContextProps: ChessContextProps;
  setChessState: Dispatch<SetStateAction<Chess>>;
  setChessContextState: Dispatch<SetStateAction<ChessContextProps>>;
  setChessBoardOptionsState: Dispatch<SetStateAction<ChessboardOptions>>;
}

interface ChessContextProps {
  //position
  position: string;
  history: Move[];
  turn: "w" | "b";

  //chessboardOptions
  chessboardOptions: ChessboardOptions;

  //engine
  engine: string;
  numberOfLines: number;
  maxEvaluationTime: number;
  engineEvaluationProgress: number;
  evaluation: EngineEvaluation[];
}

function ChessProvider({ children }: { children: ReactNode }) {
  const [chess, setChess] = useState<Chess>(new Chess());
  const [chessContext, setChessContext] = useState<ChessContextProps>({
    history: chess.history({ verbose: true }),
    position: DEFAULT_POSITION,
    evaluation: [],
    turn: chess.turn(),
    engine: "stockfish-18-lite-single",
    numberOfLines: 3,
    maxEvaluationTime: 3000,
    engineEvaluationProgress: 0,
    chessboardOptions: {},
  });
  const [chessboardParams, setChessBoardParams] = useState<ChessboardOptions>({
    position: chessContext.position,
    boardStyle: {
      maxWidth: "800px",
      minWidth: "300px",
      width: "calc(2/3 * 100%)",
      height: "auto",
    },
  });

  const { analyzePosition, stopAnalysis } = useStockfish({
    multiPVCount: chessContext?.maxEvaluationTime,
    stockfishVersion: `/${chessContext.engine}.js`,
    onEvaluationUpdate: (latestLines) => {
      setChessContext({
        ...chessContext,
        evaluation: latestLines,
      });
    },
  });

  const stockfishProgress = useStockfishEvalProgress(
    chessContext?.maxEvaluationTime,
  );

  useEffect(() => {
    stopAnalysis();
    stockfishProgress.reset();
    analyzePosition(chessContext.position, chessContext.maxEvaluationTime);
  }, [
    chessContext.position,
    chessContext.maxEvaluationTime,
    stockfishProgress,
    stopAnalysis,
    analyzePosition,
  ]);

  // const onPieceDrop = (
  //   piece: { isSparePiece: boolean; pieceType: string; position: string },
  //   sourceSquare: string,
  //   targetSquare: string | null,
  // ) => {
  //
  // };
  // const onPieceClick = (
  //   isSparePiece: boolean,
  //   piece: { pieceType: string },
  //   square: string | null,
  // ) => {
  //
  // };

  return (
    <ChessContext
      value={{
        chessContextProps: {
          ...chessContext,
          engineEvaluationProgress: stockfishProgress.progress,
          chessboardOptions: chessboardParams,
        },
        setChessState: setChess,
        setChessContextState: setChessContext,
        setChessBoardOptionsState: setChessBoardParams,
      }}
    >
      {children}
    </ChessContext>
  );
}

function useStockfishEvalProgress(stockfishMaxTime: number) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (count >= stockfishMaxTime) return;

    const timer = setInterval(() => {
      setCount((prev) => {
        if (prev >= stockfishMaxTime - 1) {
          clearInterval(timer);
        }
        return prev + 100;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [count, stockfishMaxTime]);

  const reset = useCallback(() => setCount(0), []);

  const progress = (count * 100) / stockfishMaxTime;

  return { progress, reset };
}

function useChessContext() {
  const context = useContext(ChessContext);
  if (context === undefined) {
    throw new Error("useChessContext must be used within a ChessProvider");
  }
  return context;
}

export { useChessContext, ChessProvider };
