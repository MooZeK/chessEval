import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { type Move } from "chess.js";
import { Button } from "../ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { useChessContext } from "../../src/ChessContext.tsx";
import { useState } from "react";

interface MovesData {
  next: string;
  san: string;
  moveNumber: number;
  // for styling

  hasBeenPlayedYet: boolean;
}

function History(props: { moves: Move[] }) {
  const [movesData, setMovesData] = useState<MovesData[]>(() =>
    props.moves.map((move, i) => ({
      next: move.after,
      san: move.san,
      moveNumber: i,
      hasBeenPlayedYet: true,
    })),
  );

  const {
    chessContextProps,
    chessboardOptions,
    setChessContextState,
    setChessBoardOptionsState,
  } = useChessContext();

  const goToPosition = (fen: string) => {
    setChessContextState({
      ...chessContextProps,
      position: fen,
    });
    setChessBoardOptionsState({
      ...chessboardOptions,
      position: fen,
    });
  };
  const highlightHistoryUpToPosition = (moveIndex: number) => {
    setMovesData(
      movesData.map((move, i) => {
        if (i < moveIndex) return move;

        return {
          ...move,
          hasBeenPlayedYet: false,
        };
      }),
    );
  };

  return (
    <ScrollArea className={"w-full b-0 h-full"}>
      <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableHead colSpan={4}>History</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="*:border-b-1 border-gray-200">
          {movesData &&
            movesData.map((move, i) => {
              if (i % 2 === 1) {
                return <></>;
              }
              const nextmove = movesData[i + 1];

              return (
                <TableRow key={i + movesData[i].san}>
                  <TableCell
                    className={
                      move.hasBeenPlayedYet
                        ? "text-foreground font-medium"
                        : "text-muted-foreground"
                    }
                  >
                    {i / 2 + 1}.
                  </TableCell>
                  <TableCell
                    className={
                      move.hasBeenPlayedYet
                        ? "text-foreground font-medium"
                        : "text-muted-foreground"
                    }
                  >
                    {" "}
                    <Button
                      key={move.next}
                      onClick={() => {
                        goToPosition(move.next);
                        highlightHistoryUpToPosition(move.moveNumber);
                      }}
                      variant={"link"}
                    >
                      {move.san}
                    </Button>
                  </TableCell>
                  <TableCell
                    className={
                      nextmove?.hasBeenPlayedYet
                        ? "text-foreground font-medium"
                        : "text-muted-foreground"
                    }
                  >
                    {" "}
                    {nextmove && (
                      <Button
                        key={nextmove.next}
                        onClick={() => {
                          goToPosition(nextmove.next);
                          highlightHistoryUpToPosition(nextmove.moveNumber);
                        }}
                        variant={"link"}
                      >
                        {nextmove.san}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          {movesData.length === 0 && (
            <TableRow>
              <TableCell colSpan={4}>No history available.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <ScrollBar />
    </ScrollArea>
  );
}

export default History;
