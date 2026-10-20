import { Button, Checkbox, Flex, SimpleGrid, Text } from "@mantine/core";
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
      tool="/semaphore"
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
            <Text size="xs" c="dimmed">
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
          <Flex
            gap="md"
            direction={{ base: "column", sm: "row" }}
            align={{ base: "center", sm: "stretch" }}
          >
            <SemaphorePerson
              positions={arms}
              interactive
              onSelectPosition={selectDirection}
              size={240}
            />
            <SimpleGrid
              cols={{ base: 2, sm: 1 }}
              spacing="xs"
              w="100%"
              maw={{ sm: 240 }}
              className="content-center"
            >
              <Button
                size="md"
                px="xs"
                className="col-span-full"
                onClick={() =>
                  setDecodeInput((prev) =>
                    prev ? `${prev} ${pairLabel(arms)}` : pairLabel(arms),
                  )
                }
              >
                Add “{decodeFromSemaphorePositions([arms]) || pairLabel(arms)}”
              </Button>
              <Button
                variant="light"
                color="gray"
                size="md"
                px="xs"
                onClick={() =>
                  setDecodeInput((prev) => (prev ? `${prev} /` : "/"))
                }
              >
                Space
              </Button>
              <Button
                variant="subtle"
                color="red"
                size="md"
                px="xs"
                onClick={() => setArms([0, 0])}
              >
                Reset
              </Button>
            </SimpleGrid>
          </Flex>
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
              <Text size="xs" c="dimmed">
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
