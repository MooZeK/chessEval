import {
  createContext,
  type CSSProperties,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Chess, DEFAULT_POSITION, type Move, type Square } from "chess.js";
import {
  type EngineEvaluation,
  useStockfish,
} from "../components/stockfish/stockfish.tsx";
import type {
  ChessboardOptions,
  PieceDropHandlerArgs,
  PieceHandlerArgs,
  SquareHandlerArgs,
} from "react-chessboard";

const ChessContext = createContext<ChessContextType | undefined>(undefined);

interface ChessContextType {
  chessContextProps: ChessContextProps;
  chessboardOptions: ChessboardOptions;
  setChessState: Dispatch<SetStateAction<Chess>>;
  setChessContextState: Dispatch<SetStateAction<ChessContextProps>>;
  setChessBoardOptionsState: Dispatch<SetStateAction<ChessboardOptions>>;
}

interface ChessContextProps {
  //position
  position: string;
  history: Move[];
  turn: "w" | "b";

  //engine
  engine: string;
  shouldPrecalculate: boolean;
  bestLinePercentages: number[];
  numberOfLines: number;
  maxEvaluationTime: number;
  engineEvaluationProgress: number;
  evaluation: EngineEvaluation[];
}

function ChessProvider({ children }: { children: ReactNode }) {
  const [chess, setChess] = useState<Chess>(new Chess(DEFAULT_POSITION));
  const [chessContext, setChessContext] = useState<ChessContextProps>({
    history: chess.history({ verbose: true }),
    position: DEFAULT_POSITION,
    evaluation: [],
    turn: chess.turn(),
    engine: "stockfish-18-lite-single",
    bestLinePercentages: [],
    numberOfLines: 3,
    maxEvaluationTime: 3000,
    engineEvaluationProgress: 0,
  });
  const [chessboardParams, setChessBoardParams] = useState<ChessboardOptions>({
    position: chessContext.position,
    boardStyle: {
      maxWidth: "800px",
      minWidth: "300px",
      width: "calc(2/3 * 100%)",
      height: "auto",
    },
    id: "my-chessboad",
    squareStyles: {},
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
    stockfishProgress.reset,
    stopAnalysis,
    analyzePosition,
  ]);

  const onPieceDropped = ({
    sourceSquare,
    targetSquare,
  }: PieceDropHandlerArgs) => {
    if (!sourceSquare || !targetSquare) return false;

    const availableMoves = chess.moves({
      square: sourceSquare as Square,
      verbose: true,
    });

    const availableSquares = availableMoves.map((move) => move.to);

    if (!availableSquares.includes(targetSquare as Square)) return false;

    const liveGame = new Chess();
    liveGame.loadPgn(chess.pgn());

    const moveToBeMade = liveGame.move({
      from: sourceSquare,
      to: targetSquare,
    });

    if (!moveToBeMade) return false;

    setChess(liveGame);
    setChessContext({
      ...chessContext,
      history: liveGame.history({ verbose: true }),
    });
    setChessBoardParams({
      ...chessboardParams,
      position: liveGame.fen(),
    });
    return true;
  };
  const onSquareClicked = ({
    square,
  }: SquareHandlerArgs | PieceHandlerArgs) => {
    if (!square) return;

    const availableMoves = chess.moves({
      square: square as Square,
      verbose: true,
    });

    if (availableMoves.length === 0) {
      setChessBoardParams({
        ...chessboardParams,
        squareStyles: {},
      });
      return;
    }

    const newSquaresStyles: Record<string, CSSProperties> = {};

    availableMoves.forEach((move) => {
      newSquaresStyles[move.to] = {
        background: "rgba(255, 255, 0, 0.4)",
      };
    });

    // Also highlight the clicked square itself if you want
    newSquaresStyles[square] = {
      background: "rgba(255, 255, 0, 0.2)",
    };

    setChessBoardParams({
      ...chessboardParams,
      squareStyles: newSquaresStyles,
    });
  };

  return (
    <ChessContext
      value={{
        chessContextProps: {
          ...chessContext,
          engineEvaluationProgress: stockfishProgress.progress,
        },
        chessboardOptions: {
          ...chessboardParams,
          onSquareClick: onSquareClicked,
          onPieceDrag: onSquareClicked,
          onPieceDrop: onPieceDropped,
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
        return prev + 25;
      });
    }, 25);

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
