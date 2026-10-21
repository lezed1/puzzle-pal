import { Badge, Group, Select } from "@mantine/core";
import { createFileRoute, stripSearchParams } from "@tanstack/react-router";
import { MorseTapPad } from "../components/morse/MorseTapPad";
import { ReferenceTable } from "../components/tools/ReferenceTable";
import { ToolView } from "../components/tools/ToolView";
import {
  parseTextSearch,
  type TextDraft,
  tabParams,
  useTextDraft,
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
type LetterSep = keyof typeof LETTER_SEPARATORS;
type WordSep = keyof typeof WORD_SEPARATORS;

const toSelectData = (seps: Record<string, { label: string }>) =>
  Object.entries(seps).map(([value, { label }]) => ({ value, label }));

const oneOf = <T extends string>(
  v: unknown,
  options: readonly T[],
  fallback: T,
) => (options.includes(v as T) ? (v as T) : fallback);

interface MorseSearch extends TextDraft {
  sep: LetterSep;
  wsep: WordSep;
}

const DEFAULTS = {
  text: "SOS PUZZLE",
  sep: "space",
  wsep: "slash",
} satisfies MorseSearch;

export const Route = createFileRoute("/morse/{-$tab}")({
  params: tabParams,
  validateSearch: (
    s: Partial<Record<keyof MorseSearch, unknown>>,
  ): MorseSearch => ({
    ...parseTextSearch(s, DEFAULTS.text),
    sep: oneOf(
      s.sep,
      Object.keys(LETTER_SEPARATORS) as LetterSep[],
      DEFAULTS.sep,
    ),
    wsep: oneOf(
      s.wsep,
      Object.keys(WORD_SEPARATORS) as WordSep[],
      DEFAULTS.wsep,
    ),
  }),
  search: { middlewares: [stripSearchParams(DEFAULTS)] },
  component: MorsePage,
});

function MorsePage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const update = (patch: Partial<MorseSearch>) =>
    navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true });
  const { draft, setText, setCode } = useTextDraft(
    search,
    update,
    decodeFromMorse,
  );
  const decodeInput = draft.code ?? encodeToMorse(draft.text);

  return (
    <ToolView
      tool="/morse"
      encode={{
        input: draft.text,
        onInputChange: setText,
        output: encodeToMorse(draft.text, {
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
              onChange={(val) => val && update({ sep: val as LetterSep })}
            />
            <Select
              label="Word Separator"
              size="xs"
              w={160}
              data={toSelectData(WORD_SEPARATORS)}
              value={search.wsep}
              onChange={(val) => val && update({ wsep: val as WordSep })}
            />
          </Group>
        ),
      }}
      decode={{
        input: decodeInput,
        onInputChange: setCode,
        output: draft.text,
        sampleText: ".... . .-.. .-.. --- / .-- --- .-. .-.. -..",
        interactiveWidget: (
          <MorseTapPad onChange={(apply) => setCode(apply(decodeInput))} />
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
