import {useCallback, useRef} from "react";
import {validateFen} from "chess.js";
import {parse} from "@mliebelt/pgn-parser"

function Datainput(props: {
  onDataSubmit: (data: string, type:boolean) => void;
}) {
  const DataInputField = useRef<HTMLTextAreaElement>(null);


  const handleDataValidation = useCallback(
      (data:string | undefined) => {
          if(data === undefined) return;

          const isFEN = validateFen(data.toString().trim());
          if(isFEN.ok){
              props.onDataSubmit(data,true)
              return
          }
          //if not FEN, do whats down here
          console.warn("Data provided is not FEN. Checking if its PGN")

          try{
              parse(data?.toString().trim(), {startRule: "games"});
              props.onDataSubmit(data,false)
          }catch(e){
              console.error(e + "\n Data is neither PGN not FEN");
              alert("Data is neither PGN not FEN")
          }


      },[])


  return (
    <div className="Datainput w-3/4 mx-auto flex">
      <textarea
        ref={DataInputField}
        placeholder={`input your PGN/FEN here`}
      ></textarea>
      <button onClick={() => handleDataValidation(DataInputField.current?.value)}>
        Submit
      </button>
    </div>
  );
}

export default Datainput;
