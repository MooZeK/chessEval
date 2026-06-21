import { useEffect, useRef, useCallback } from "react";

// Define the shape of our parsed evaluation data
export interface EngineEvaluation {
  multipv: number; // The rank of the move (1 = best, 2 = second best, etc.)
  depth: number;
  scoreType: "cp" | "mate"; // cp = centipawns, mate = moves until forced mate
  scoreValue: number;
  pv: string; // Principal Variation (the predicted line of moves)
}

interface UseStockfishProps {
  onEvaluationUpdate: (lines: EngineEvaluation[]) => void;
  multiPVCount?: number; // How many lines to look at (e.g., 3 or 5)
}

export const useStockfish = ({
  onEvaluationUpdate,
  multiPVCount = 3,
}: UseStockfishProps) => {
  const workerRef = useRef<Worker | null>(null);
  const resultsAccumulator = useRef<Map<number, EngineEvaluation>>(new Map());

  useEffect(() => {
    const worker = new Worker("public/stockfish-18-lite-single.js");
    workerRef.current = worker;

    worker.onmessage = (event: MessageEvent) => {
      const line = event.data;

      // We look for information lines containing score evaluations
      if (line.startsWith("info") && line.includes("multipv")) {
        const parsed = parseUCIInfoLine(line);
        if (parsed) {
          // Accumulate the latest data for each specific multiPV index
          resultsAccumulator.current.set(parsed.multipv, parsed);

          // Send an array sorted by best move first back to the UI
          const sortedLines = Array.from(
            resultsAccumulator.current.values(),
          ).sort((a, b) => a.multipv - b.multipv);

          onEvaluationUpdate(sortedLines);
        }
      }
    };

    // Initialize UCI Protocol
    worker.postMessage("uci");

    // CRITICAL: Configure Stockfish to calculate multiple lines
    worker.postMessage(`setoption name MultiPV value ${multiPVCount}`);
    worker.postMessage("isready");

    return () => {
      worker.terminate();
    };
  }, [multiPVCount, onEvaluationUpdate]);

  const analyzePosition = useCallback((fen: string, depth = 12) => {
    if (!workerRef.current) return;
    resultsAccumulator.current.clear(); // Wipe previous evaluations
    workerRef.current.postMessage(`position fen ${fen}`);
    workerRef.current.postMessage(`go depth ${depth}`);
  }, []);

  return { analyzePosition };
};

// Helper parser for Stockfish text output stream
export function parseUCIInfoLine(line: string): EngineEvaluation | null {
  const parts = line.split(" ");

  const depthIdx = parts.indexOf("depth");
  const multipvIdx = parts.indexOf("multipv");
  const scoreIdx = parts.indexOf("score");
  const pvIdx = parts.indexOf("pv");

  if (multipvIdx === -1 || scoreIdx === -1) return null;

  const multipv = parseInt(parts[multipvIdx + 1], 10);
  const depth = depthIdx !== -1 ? parseInt(parts[depthIdx + 1], 10) : 0;

  const scoreType = parts[scoreIdx + 1] as "cp" | "mate"; // 'cp' or 'mate'
  const scoreValue = parseInt(parts[scoreIdx + 2], 10);

  // Extract the line of moves
  const pv = pvIdx !== -1 ? parts.slice(pvIdx + 1).join(" ") : "";

  return { multipv, depth, scoreType, scoreValue, pv };
}

export const getAbsoluteWhiteScore = (
  evalData: EngineEvaluation,
  activeColor: "w" | "b",
) => {
  let score = evalData.scoreValue;

  // 1. Convert to Mate weighting or Centipawns decimal
  if (evalData.scoreType === "mate") {
    // If it's a forced mate, assign an arbitrarily large score based on direction
    score = score > 0 ? 1000 : -1000;
  } else {
    // Convert centipawns to standard pawn decimals (e.g., 150 -> 1.5)
    score = score / 100;
  }

  // 2. Flip perspective if it is Black's turn to move
  if (activeColor === "b") {
    score = -score;
  }

  return score; // Positive = White winning, Negative = Black winning
};

export const calculateBarPercentage = (whiteScore: number): number => {
  // If score is 0, bar is perfectly split (50%)
  // A +3 advantage gives White roughly ~85% of the bar, -3 gives ~15%
  const lean = 0.35;
  const percentage = 100 / (1 + Math.exp(-lean * whiteScore));
  return Math.min(Math.max(percentage, 5), 95); // Clamp between 5% and 95% so neither side disappears completely
};
