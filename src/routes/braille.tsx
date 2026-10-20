import { Button, Checkbox, Group, Stack, Text } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BrailleCell } from "../components/braille/BrailleCell";
import { ReferenceTable } from "../components/tools/ReferenceTable";
import { SymbolTile, ToolView } from "../components/tools/ToolView";
import {
  BRAILLE_REFERENCE_LIST,
  decodeFromBraille,
  dotsToUnicode,
  encodeToBrailleCells,
  unicodeToDots,
} from "../lib/braille";

export const Route = createFileRoute("/braille")({
  component: BraillePage,
});

function BraillePage() {
  const [encodeInput, setEncodeInput] = useState("PUZZLE PAL");
  const [includeNumberSign, setIncludeNumberSign] = useState(false);
  const [includeCapitalSign, setIncludeCapitalSign] = useState(false);
  const [decodeInput, setDecodeInput] = useState("⠏⠥⠵⠵⠇⠑ ⠏⠁⠇");
  const [pinpadDots, setPinpadDots] = useState<number[]>([1]);

  const toggleDot = (dot: number) =>
    setPinpadDots((prev) =>
      prev.includes(dot)
        ? prev.filter((d) => d !== dot)
        : [...prev, dot].sort(),
    );

  const pinpadUnicode = dotsToUnicode(pinpadDots);
  const cells = encodeToBrailleCells(encodeInput, {
    includeNumberSign,
    includeCapitalSign,
  });

  return (
    <ToolView
      tool="/braille"
      encode={{
        input: encodeInput,
        onInputChange: setEncodeInput,
        output: cells.map((c) => c.cell).join(""),
        sampleText: "ESCAPE ROOM 2026",
        controls: (
          <Group gap="lg">
            <Checkbox
              label="Include Number Prefix (⠼)"
              checked={includeNumberSign}
              onChange={(e) => setIncludeNumberSign(e.currentTarget.checked)}
            />
            <Checkbox
              label="Include Capital Prefix (⠠)"
              checked={includeCapitalSign}
              onChange={(e) => setIncludeCapitalSign(e.currentTarget.checked)}
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
        onInputChange: setDecodeInput,
        output: decodeFromBraille(decodeInput),
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
                onClick={() => setDecodeInput((prev) => prev + pinpadUnicode)}
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
                onClick={() => setDecodeInput((prev) => `${prev} `)}
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
