import { Badge, Button, Checkbox, Group, Stack, Text } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SemaphorePerson } from "../components/semaphore/SemaphorePerson";
import { ReferenceTable } from "../components/tools/ReferenceTable";
import { SymbolTile, ToolView } from "../components/tools/ToolView";
import {
  DIRECTION_NAMES,
  decodeFromSemaphorePositions,
  encodeToSemaphore,
  parseSemaphorePairs,
  SEMAPHORE_REFERENCE_LIST,
  type SemaphoreDirection,
  type SemaphorePair,
} from "../lib/semaphore";

export const Route = createFileRoute("/semaphore")({
  component: SemaphorePage,
});

const pairLabel = ([a, b]: SemaphorePair) => `${a},${b}`;

function SemaphorePage() {
  const [encodeInput, setEncodeInput] = useState("FLAG");
  const [includeNumberSign, setIncludeNumberSign] = useState(true);
  const [decodeInput, setDecodeInput] = useState("0,6 1,5 0,1 0,7");
  const [arms, setArms] = useState<SemaphorePair>([0, 1]);

  // Clicking a raised arm drops it onto the other; otherwise the oldest arm moves.
  const selectDirection = (dir: SemaphoreDirection) =>
    setArms(([a, b]) => (dir === a ? [b, b] : dir === b ? [a, a] : [b, dir]));

  const encoded = encodeToSemaphore(encodeInput, includeNumberSign);

  return (
    <ToolView
      title="Semaphore"
      icon="🚩"
      encode={{
        input: encodeInput,
        onInputChange: setEncodeInput,
        output: encoded
          .map((e) => (e.char === " " ? "/" : pairLabel(e.positions)))
          .join(" "),
        sampleText: "SECRET SIGNAL",
        controls: (
          <Checkbox
            label="Include Number Prefix (# / Pos 4,5) for Digits"
            checked={includeNumberSign}
            onChange={(e) => setIncludeNumberSign(e.currentTarget.checked)}
          />
        ),
        visualOutput: encoded.map((item) => (
          <SymbolTile key={item.id} minWidth={80}>
            <SemaphorePerson positions={item.positions} size={72} />
            <Text size="xs" fw={700}>
              {item.char === " " ? "SPACE" : item.char}
            </Text>
            <Text fz={10} c="dimmed">
              {pairLabel(item.positions)}
            </Text>
          </SymbolTile>
        )),
      }}
      decode={{
        input: decodeInput,
        onInputChange: setDecodeInput,
        output: decodeFromSemaphorePositions(parseSemaphorePairs(decodeInput)),
        sampleText: "0,6 1,5 0,1 0,7 / 2,4 0,1 1,5",
        interactiveWidget: (
          <Group justify="space-between" wrap="wrap" gap="md">
            <Group gap="lg">
              <SemaphorePerson
                positions={arms}
                interactive
                onSelectPosition={selectDirection}
                size={140}
              />
              <Stack gap={2}>
                <Text size="xs" fw={600}>
                  Positions: {arms[0]} & {arms[1]}
                </Text>
                <Text size="xs" c="dimmed">
                  {DIRECTION_NAMES[arms[0]]} / {DIRECTION_NAMES[arms[1]]}
                </Text>
                <Group gap="xs" mt={2}>
                  <Text size="xs">Decodes to:</Text>
                  <Badge size="md">
                    {decodeFromSemaphorePositions([arms]) || "?"}
                  </Badge>
                </Group>
              </Stack>
            </Group>
            <Group gap="xs">
              <Button
                size="xs"
                onClick={() =>
                  setDecodeInput((prev) =>
                    prev ? `${prev} ${pairLabel(arms)}` : pairLabel(arms),
                  )
                }
              >
                + Append ({pairLabel(arms)})
              </Button>
              <Button
                variant="light"
                color="gray"
                size="xs"
                onClick={() =>
                  setDecodeInput((prev) => (prev ? `${prev} /` : "/"))
                }
              >
                + Space
              </Button>
              <Button
                variant="subtle"
                color="red"
                size="xs"
                onClick={() => setArms([0, 0])}
              >
                Reset (0,0)
              </Button>
            </Group>
          </Group>
        ),
      }}
      reference={
        <ReferenceTable
          items={SEMAPHORE_REFERENCE_LIST}
          renderSymbol={({ positions }) => (
            <>
              <SemaphorePerson positions={positions} size={70} />
              <Text size="xs" fw={600} c="dimmed">
                {pairLabel(positions)}
              </Text>
              <Text fz={10} c="dimmed">
                {DIRECTION_NAMES[positions[0]]} /{" "}
                {DIRECTION_NAMES[positions[1]]}
              </Text>
            </>
          )}
        />
      }
    />
  );
}
