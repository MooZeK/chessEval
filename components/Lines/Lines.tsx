import { type EngineEvaluation } from "../stockfish/stockfish";
import { Chess } from "chess.js";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

function Lines(props: { lines: EngineEvaluation[]; position: string }) {
  const sortedEvaluations = [...props.lines].sort(
    (a, b) => a.multipv - b.multipv,
  );

  const convertUciToSan = (uciLine: string): string[] => {
    if (!uciLine) return [];

    const chessClone = new Chess(props.position);
    const uciMoves = uciLine.split(" ");
    const sanMoves: string[] = [];

    for (const uci of uciMoves) {
      try {
        const move = chessClone.move({
          from: uci.substring(0, 2),
          to: uci.substring(2, 4),
          promotion: uci.length === 5 ? uci.charAt(4) : undefined,
        });

        if (move) {
          sanMoves.push(move.san);
        } else {
          break;
        }
      } catch (e) {
        console.error(e);
        break;
      }
    }

    return sanMoves;
  };

  return (
    <Table className="w-full">
      <TableHeader>
        <TableRow>
          <TableHead colSpan={4}>Lines</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedEvaluations.map((evaluation) => {
          const sanLine = convertUciToSan(evaluation.pv);
          return (
            <TableRow key={evaluation.multipv}>
              <TableCell className={"text-right w-5"}>
                {formatScore(evaluation.scoreType, evaluation.scoreValue)}
              </TableCell>
              <TableCell
                className={"text-center overflow-x-clip scrollbar-auto"}
              >
                {sanLine.map((move, index) => {
                  const isWhiteMove = index % 2 === 0;
                  const moveNumber = Math.floor(index / 2) + 1;
                  return (
                    <span key={index}>
                      {isWhiteMove ? `${moveNumber}. ` : ""}
                      {move}{" "}
                    </span>
                  );
                })}
              </TableCell>
              <TableCell className={"text-right"}>
                depth:{evaluation.depth}
              </TableCell>
            </TableRow>
          );
        })}
        {sortedEvaluations.length === 0 && (
          <TableRow>
            <TableCell colSpan={4}>No engine evaluations yet.</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

const formatScore = (type: "cp" | "mate", value: number): string => {
  if (type === "mate") {
    return `M${Math.abs(value)}`;
  }
  const converted = (value / 100).toFixed(2);
  return value >= 0 ? `+${converted}` : converted;
};
export default Lines;
