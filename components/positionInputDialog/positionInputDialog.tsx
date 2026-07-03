import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { ButtonGroup } from "@/components/ui/button-group";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ArrowDownIcon } from "lucide-react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { DEFAULT_POSITION } from "chess.js";
import { useState } from "react";

const FEN_PATTERN =
  /^([rnbqkpRNBQKP1-8]{1,8}\/){7}[rnbqkpRNBQKP1-8]{1,8}\s[wb]\s(-|[KkQq]{1,4})\s(-|[a-h][36])\s\d+\s\d+$/;

const PGN_PATTERN =
  /^(?:\[Event\s".+"\][\r\n]*)(?:\[Site\s".+"\][\r\n]*)(?:\[Date\s".+"\][\r\n]*)(?:\[Round\s".+"\][\r\n]*)(?:\[White\s".+"\][\r\n]*)(?:\[Black\s".+"\][\r\n]*)(?:\[Result\s".+"\][\r\n]*)(?:\[[\s\S]*?\][\r\n]*)*\s*(?:[1-9]\d*\.\s*\S+\s+(?:\S+\s+)?)+(?:1-0|0-1|1\/2-1\/2|\*)?$/;

// This schema validates if the string is either a FEN or a PGN
const chessInputSchema = z.object({
  position: z.union(
    [z.string().regex(FEN_PATTERN), z.string().regex(PGN_PATTERN)],
    {
      error: () => ({
        message:
          "Input must be a valid FEN string or a standard PGN game text.",
      }),
    },
  ),
});

function PositionInputDialog(props: {
  chessPositionSetter: (position: string) => void;
}) {
  const positionSetter = props.chessPositionSetter;

  const [isOpen, setIsOpen] = useState(false);

  const positionForm = useForm({
    defaultValues: {
      position: "",
    },
    validators: {
      onBlurAsync: chessInputSchema,
    },
    onSubmit: ({ value }) => {
      positionSetter(value.position);
      setIsOpen(false);
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger>
        <Button>
          <ArrowDownIcon />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            positionForm.handleSubmit();
          }}
        >
          <FieldSet>
            <FieldLegend>Game importing</FieldLegend>
            <FieldDescription>Import your game</FieldDescription>
            <FieldGroup>
              <positionForm.Field
                name="position"
                validators={{
                  onBlur: z.string().min(1, "position data required"),
                  onBlurAsyncDebounceMs: 500,
                  onBlurAsync: chessInputSchema.shape.position,
                }}

                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;

                  return (
                    <Field>
                      <FieldLabel htmlFor={field.name}>
                        Paste it down here, using FEN or PGN
                      </FieldLabel>

                      <Textarea
                        required={true}
                        id={field.name}
                        rows={4}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder={DEFAULT_POSITION}
                        aria-invalid={isInvalid}
                      />

                      <FieldDescription>
                        This data is needed for evaluation
                      </FieldDescription>
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              ></positionForm.Field>
              <positionForm.Subscribe
                selector={(state) => [state]}
                children={([canSubmit, isSubmitting]) => (
                  <ButtonGroup>
                    <ButtonGroup>
                      <Button
                        type={"submit"}
                        variant={"default"}
                        disabled={!canSubmit}
                        onClick={(e) => {
                          e.preventDefault();
                          positionForm.handleSubmit();
                        }}
                      >
                        {isSubmitting ? "..." : "Submit"}
                      </Button>
                    </ButtonGroup>
                    <ButtonGroup>
                      <Button
                        type={"reset"}
                        variant={"secondary"}
                        onClick={(e) => {
                          e.preventDefault();
                          positionForm.reset();
                        }}
                      >
                        Reset
                      </Button>
                    </ButtonGroup>
                  </ButtonGroup>
                )}
              ></positionForm.Subscribe>
            </FieldGroup>
          </FieldSet>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export { PositionInputDialog, FEN_PATTERN, PGN_PATTERN };
