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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { SettingsIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

// This schema validates if the string is either a FEN or a PGN

const CHESS_ENGINES = ["stockfish-18", "stockfish-18-lite-single"];

const SETTING_SCHEMA = z.object({
  stockfishVersion: z.enum(CHESS_ENGINES, {
    error: "stockfish version must be of one listed",
  }),
  stockfishMaxTime: z
    .number({error: "stockfish max time must be a number"})
    .min(3000, {error: "Evaluation time must be at least 3000ms"}),
    stockfishLinesNumber: z.number({error: "Number of lines must be a number"}).min(0,{error: "Number of lines must be non-negative"}),
});

function SettingsDialog(props: {
  settingsSetter: (stockfishVersion: string, stockfishMaxTime: number, stockfishLinesNumber: number) => void;
}) {
  const settingSetter = props.settingsSetter;

  const [isOpen, setIsOpen] = useState(false);

  const settingsForm = useForm({
    defaultValues: {
      stockfishVersion: CHESS_ENGINES[0],
      stockfishMaxTime: 3000,
        stockfishLinesNumber: 3,
    },
    validators: {
      onBlur: SETTING_SCHEMA,
    },
    onSubmit: ({ value }) => {
      settingSetter(value.stockfishVersion, value.stockfishMaxTime,value.stockfishLinesNumber);
      setIsOpen(false);
    },
  });

  const items = CHESS_ENGINES.map((value) => {
    return { label: value.replaceAll("-", " "), value: value };
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger>
        <Button>
          <SettingsIcon />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            settingsForm.handleSubmit();
          }}
        >
          <FieldSet>
            <FieldLegend>Engine Settings</FieldLegend>
            <FieldDescription>
              Customize for better evaluation experience
            </FieldDescription>
            <FieldGroup>
              <settingsForm.Field
                name="stockfishVersion"
                validators={{
                  onBlur: SETTING_SCHEMA.shape.stockfishVersion,
                }}

                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;

                  return (
                    <Field>
                      <FieldLabel htmlFor={field.name}>
                        Chose desired stockfish version
                      </FieldLabel>
                      <Select
                        items={CHESS_ENGINES}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onValueChange={(value: string) =>
                          field.handleChange(value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={"Select stockfish version"}
                          />
                        </SelectTrigger>
                        <SelectContent alignItemWithTrigger={false}>
                          <SelectGroup>
                            <SelectLabel>
                              Available stockfish versions
                            </SelectLabel>
                            {items.map((item) => (
                              <SelectItem key={item.value} value={item.value}>
                                {item.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              ></settingsForm.Field>
              <settingsForm.Field
                name="stockfishMaxTime"
                validators={{
                    onBlurAsyncDebounceMs: 500,
                    onBlurAsync: SETTING_SCHEMA.shape.stockfishMaxTime,
                }}
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;

                  return (
                    <Field >
                      <FieldLabel htmlFor={field.name}>
                        Select max time for evaluation
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        onBlur={field.handleBlur}
                        min={3000}
                        type={"number"}
                        placeholder={"3000ms"}
                        value={field.state.value ?? undefined}
                        aria-invalid={isInvalid}
                        onChange={(e) => field.handleChange(e.target.valueAsNumber)}
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              ></settingsForm.Field>
                <settingsForm.Field
                    name="stockfishLinesNumber"
                    validators={{
                        onBlurAsyncDebounceMs: 500,
                        onBlurAsync: SETTING_SCHEMA.shape.stockfishLinesNumber,
                    }}
                    children={(field)=>{
                        const isInvalid =
                            field.state.meta.isTouched && !field.state.meta.isValid;

                        return (
                            <Field >
                                <FieldLabel htmlFor={field.name}>
                                    Select number of evaluated lines
                                </FieldLabel>
                                <Input
                                    id={field.name}
                                    name={field.name}
                                    onBlur={field.handleBlur}
                                    min={0}
                                    type={"number"}
                                    placeholder={"number of lines"}
                                    value={field.state.value ?? undefined}
                                    aria-invalid={isInvalid}
                                    onChange={(e) => field.handleChange(e.target.valueAsNumber)}
                                />
                                {isInvalid && (
                                    <FieldError errors={field.state.meta.errors} />
                                )}
                            </Field>
                        );
                    }}
                ></settingsForm.Field>
              <settingsForm.Subscribe
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
                          settingsForm.handleSubmit();
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
                          settingsForm.reset();
                        }}
                      >
                        Reset
                      </Button>
                    </ButtonGroup>
                  </ButtonGroup>
                )}
              ></settingsForm.Subscribe>
            </FieldGroup>
          </FieldSet>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export { SettingsDialog };
