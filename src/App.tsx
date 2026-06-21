import ChessBoard from "./components/chessboard/chessboard.tsx";
import { Chess } from "chess.js";
import { useState } from "react";
import Datainput from "./components/DataInputs/Datainputs.tsx";

function App() {
  const [chess, setChess] = useState<Chess>(new Chess());

  const handleHistoryInput = (data: string,isFEN:boolean) => {
    const newChess = new Chess();
    if (isFEN) {
      newChess.load(data)
    } else {
      newChess.loadPgn(data)
    }
    setChess(newChess);
  };

  return (
    <div>
      <ChessBoard chess={chess} />
      <Datainput
        onDataSubmit={handleHistoryInput}
      />
    </div>
  );
}
export default App;
