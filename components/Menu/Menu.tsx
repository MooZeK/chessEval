import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Progress } from "../ui/progress";
import { ButtonGroup } from "../ui/button-group";
import { PositionInputDialog } from "../positionInputDialog/positionInputDialog";
import { SettingsDialog } from "../SettingsDialog/SettingDialog";
import { Separator } from "../ui/separator";
import Lines from "../Lines/Lines";
import History from "../History/History";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useChessContext } from "../../src/ChessContext.tsx";
import { Chess } from "chess.js";
import { z } from "zod";
import {
  FEN_PATTERN,
  PGN_PATTERN,
} from "../positionInputDialog/positionInputDialog.tsx";

function Menu() {
  const { chessContextProps, setChessState, setChessContextState } =
    useChessContext();

  const handleGameChange = (value: string) => {
    const FENresult = z.string().regex(FEN_PATTERN).safeParse(value);
    const PGNresult = z.string().regex(PGN_PATTERN).safeParse(value);
    const chess = new Chess();

    if (FENresult.success) {
      chess.load(value);
    } else if (PGNresult.success) {
      chess.loadPgn(value);
    } else {
      console.error("Bad, really bad");
    }
    setChessState(chess);
    setChessContextState({
      ...chessContextProps,
      history: chess.history({ verbose: true }),
      position: chess.fen(),
      turn: chess.turn(),
    });
    return;
  };

  const handleSettingsChange = (
    engineVersion: string,
    engineMaxTime: number,
    engineLinesNumber: number,
  ) => {
    setChessContextState({
      ...chessContextProps,
      engine: engineVersion,
      maxEvaluationTime: engineMaxTime,
      numberOfLines: engineLinesNumber,
    });
    return;
  };

  return (
    <Card className="min-w-[300px] w-1/5 h-7/9 ml-5">
      <CardHeader>
        <CardTitle>{chessContextProps.engine.replaceAll("-", " ")}</CardTitle>
        <CardDescription>
          <Progress value={chessContextProps.engineEvaluationProgress} />
        </CardDescription>
        <CardAction>
          <ButtonGroup>
            <PositionInputDialog chessPositionSetter={handleGameChange} />
            <SettingsDialog settingsSetter={handleSettingsChange} />
          </ButtonGroup>
        </CardAction>
      </CardHeader>
      <Separator />
      <CardContent className={"overflow-y-hidden scrollbar-none"}>
        <Tabs defaultValue={"lines"}>
          <TabsList>
            <TabsTrigger value={"lines"}>Lines</TabsTrigger>
            <TabsTrigger value={"history"}>History</TabsTrigger>
          </TabsList>
          <TabsContent value={"lines"}>
            <Lines
              position={chessContextProps.position}
              lines={chessContextProps.evaluation}
            />
          </TabsContent>
          <TabsContent value={"history"} className={"h-auto"}>
            <History moves={chessContextProps.history} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default Menu;
