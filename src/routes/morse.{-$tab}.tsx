import { Badge, Group, Select } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { MorseTapPad } from "../components/morse/MorseTapPad";
import { ReferenceTable } from "../components/tools/ReferenceTable";
import { ToolView } from "../components/tools/ToolView";
import {
  setting,
  toolRouteOptions,
  useToolState,
} from "../components/tools/toolUrlState";
import {
  decodeFromMorse,
  encodeToMorse,
  MORSE_REFERENCE_LIST,
} from "../lib/morse";

const LETTER_SEPARATORS = {
  space: { sep: " ", label: "Space (' ')" },
  slash: { sep: "/", label: "Slash ('/')" },
  dash: { sep: "-", label: "Dash ('-')" },
};
const WORD_SEPARATORS = {
  slash: { sep: " / ", label: "Slash (' / ')" },
  pipe: { sep: " | ", label: "Pipe (' | ')" },
  spaces: { sep: "   ", label: "3 Spaces ('   ')" },
};

const toSelectData = (seps: Record<string, { label: string }>) =>
  Object.entries(seps).map(([value, { label }]) => ({ value, label }));
const keys = <T extends object>(o: T) =>
  Object.keys(o) as [keyof T & string, ...(keyof T & string)[]];

export const Route = createFileRoute("/morse/{-$tab}")({
  ...toolRouteOptions({
    sep: setting(z.enum(keys(LETTER_SEPARATORS)), "space"),
    wsep: setting(z.enum(keys(WORD_SEPARATORS)), "slash"),
  }),
  component: MorsePage,
});

function MorsePage() {
  const { search, update, text, code, setText, setCode } = useToolState(
    Route.useSearch(),
    encodeToMorse,
    decodeFromMorse,
  );

  return (
    <ToolView
      tool="/morse"
      encode={{
        input: text,
        onInputChange: setText,
        output: encodeToMorse(text, {
          letterSeparator: LETTER_SEPARATORS[search.sep].sep,
          wordSeparator: WORD_SEPARATORS[search.wsep].sep,
        }),
        sampleText: "MAYDAY SHIP SOS",
        controls: (
          <Group gap="md">
            <Select
              label="Letter Separator"
              size="xs"
              w={140}
              data={toSelectData(LETTER_SEPARATORS)}
              value={search.sep}
              onChange={(val) =>
                val && update({ sep: val as typeof search.sep })
              }
            />
            <Select
              label="Word Separator"
              size="xs"
              w={160}
              data={toSelectData(WORD_SEPARATORS)}
              value={search.wsep}
              onChange={(val) =>
                val && update({ wsep: val as typeof search.wsep })
              }
            />
          </Group>
        ),
      }}
      decode={{
        input: code,
        onInputChange: setCode,
        output: text,
        sampleText: ".... . .-.. .-.. --- / .-- --- .-. .-.. -..",
        interactiveWidget: (
          <MorseTapPad onChange={(apply) => setCode(apply(code))} />
        ),
      }}
      reference={
        <ReferenceTable
          items={MORSE_REFERENCE_LIST}
          renderSymbol={(item) => (
            <Badge size="md" variant="light" ff="monospace">
              {item.morse}
            </Badge>
          )}
        />
      }
    />
  );
}
