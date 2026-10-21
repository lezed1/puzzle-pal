import { Button, Checkbox, Group, Stack, Text } from "@mantine/core";
import { createFileRoute, stripSearchParams } from "@tanstack/react-router";
import { useState } from "react";
import { BrailleCell } from "../components/braille/BrailleCell";
import { ReferenceTable } from "../components/tools/ReferenceTable";
import { SymbolTile, ToolView } from "../components/tools/ToolView";
import {
  parseTextSearch,
  type TextDraft,
  tabParams,
  useTextDraft,
} from "../components/tools/toolUrlState";
import {
  BRAILLE_REFERENCE_LIST,
  decodeFromBraille,
  dotsToUnicode,
  encodeToBraille,
  encodeToBrailleCells,
  unicodeToDots,
} from "../lib/braille";

interface BrailleSearch extends TextDraft {
  num: boolean;
  cap: boolean;
}

const DEFAULTS = {
  text: "PUZZLE PAL",
  num: false,
  cap: false,
} satisfies BrailleSearch;

export const Route = createFileRoute("/braille/{-$tab}")({
  params: tabParams,
  validateSearch: (
    s: Partial<Record<keyof BrailleSearch, unknown>>,
  ): BrailleSearch => ({
    ...parseTextSearch(s, DEFAULTS.text),
    num: s.num === true,
    cap: s.cap === true,
  }),
  search: { middlewares: [stripSearchParams(DEFAULTS)] },
  component: BraillePage,
});

function BraillePage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const update = (patch: Partial<BrailleSearch>) =>
    navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true });
  const { draft, setText, setCode } = useTextDraft(
    search,
    update,
    decodeFromBraille,
  );
  const decodeInput = draft.code ?? encodeToBraille(draft.text);
  const [pinpadDots, setPinpadDots] = useState<number[]>([1]);

  const toggleDot = (dot: number) =>
    setPinpadDots((prev) =>
      prev.includes(dot)
        ? prev.filter((d) => d !== dot)
        : [...prev, dot].sort(),
    );

  const pinpadUnicode = dotsToUnicode(pinpadDots);
  const cells = encodeToBrailleCells(draft.text, {
    includeNumberSign: search.num,
    includeCapitalSign: search.cap,
  });

  return (
    <ToolView
      tool="/braille"
      encode={{
        input: draft.text,
        onInputChange: setText,
        output: cells.map((c) => c.cell).join(""),
        sampleText: "ESCAPE ROOM 2026",
        controls: (
          <Group gap="lg">
            <Checkbox
              label="Include Number Prefix (⠼)"
              checked={search.num}
              onChange={(e) => update({ num: e.currentTarget.checked })}
            />
            <Checkbox
              label="Include Capital Prefix (⠠)"
              checked={search.cap}
              onChange={(e) => update({ cap: e.currentTarget.checked })}
            />
          </Group>
        ),
        visualOutput: cells.map(({ label, cell }, i) => {
          const dots = unicodeToDots(cell);
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: output is derived and never reordered
            <SymbolTile key={i} minWidth={44}>
              {dots.length > 0 ? (
                <BrailleCell dots={dots} size="sm" />
              ) : (
                <Text size="xs" c="dimmed" h={52} className="flex items-center">
                  {cell === "\n" ? "ENTER" : cell === " " ? "SPACE" : cell}
                </Text>
              )}
              <Text size="xs" fw={700}>
                {label}
              </Text>
            </SymbolTile>
          );
        }),
      }}
      decode={{
        input: decodeInput,
        onInputChange: setCode,
        output: draft.text,
        sampleText: "125 15 123 123 135 / 1234 1 123",
        interactiveWidget: (
          <Group gap="md" wrap="nowrap" align="stretch">
            <BrailleCell
              dots={pinpadDots}
              interactive
              onToggleDot={toggleDot}
              size="xl"
            />
            <Stack
              gap="xs"
              justify="center"
              className="flex-1"
              miw={0}
              maw={240}
            >
              <Button
                size="md"
                px="xs"
                onClick={() => setCode(decodeInput + pinpadUnicode)}
                disabled={pinpadDots.length === 0}
              >
                {pinpadDots.length
                  ? `Add “${decodeFromBraille(pinpadUnicode)}”`
                  : "Add"}
              </Button>
              <Button
                variant="light"
                color="gray"
                size="md"
                px="xs"
                onClick={() => setCode(`${decodeInput} `)}
              >
                Space
              </Button>
              <Button
                variant="subtle"
                color="red"
                size="md"
                px="xs"
                onClick={() => setPinpadDots([])}
              >
                Clear
              </Button>
            </Stack>
          </Group>
        ),
      }}
      reference={
        <ReferenceTable
          items={BRAILLE_REFERENCE_LIST}
          renderSymbol={(item) => (
            <>
              <BrailleCell dots={item.dots} size="sm" />
              <Text size="xs" fw={600} c="dimmed">
                {item.dotString}
              </Text>
              <Text size="xl" c="blue" lh={1}>
                {item.unicode}
              </Text>
            </>
          )}
        />
      }
    />
  );
}
