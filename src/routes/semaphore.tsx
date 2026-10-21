import { Box, Button, Checkbox, Flex, SimpleGrid, Text } from "@mantine/core";
import { useTimeout } from "@mantine/hooks";
import { IconBackspace } from "@tabler/icons-react";
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
  const [firstArm, setFirstArm] = useState<SemaphoreDirection | null>(null);
  // Briefly shows the signal just added before the figure resets.
  const [flash, setFlash] = useState<SemaphorePair | null>(null);
  const flashTimeout = useTimeout(() => setFlash(null), 700);
  const stopFlash = () => {
    flashTimeout.clear();
    setFlash(null);
  };

  const selectDirection = (dir: SemaphoreDirection) => {
    stopFlash();
    if (firstArm === null) {
      setFirstArm(dir);
      return;
    }
    const pair: SemaphorePair = [firstArm, dir];
    setFirstArm(null);
    setFlash(pair);
    flashTimeout.start();
    setDecodeInput((prev) =>
      prev ? `${prev} ${pairLabel(pair)}` : pairLabel(pair),
    );
  };

  // A half-picked signal is discarded before any committed token.
  const backspace = () => {
    stopFlash();
    if (firstArm !== null) {
      setFirstArm(null);
      return;
    }
    setDecodeInput((prev) => prev.trimEnd().replace(/\S+$/, "").trimEnd());
  };

  const encoded = encodeToSemaphore(encodeInput, includeNumberSign);
  const flashChar = flash && decodeFromSemaphorePositions([flash]);
  // The number sign decodes to "" and rest to " ", so give them visible labels.
  const flashLabel =
    flashChar === "" ? "#" : flashChar === " " ? "␣" : flashChar;

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
            <Box pos="relative">
              <SemaphorePerson
                positions={flash ?? (firstArm === null ? [] : [firstArm])}
                interactive
                onSelectPosition={selectDirection}
                size={240}
              />
              {flash && (
                <Text
                  pos="absolute"
                  top={8}
                  right={12}
                  fz={36}
                  fw={700}
                  c="blue"
                  className="pointer-events-none"
                >
                  {flashLabel}
                </Text>
              )}
            </Box>
            <SimpleGrid
              cols={{ base: 2, sm: 1 }}
              spacing="xs"
              w="100%"
              maw={{ sm: 240 }}
              className="content-center"
            >
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
                variant="light"
                color="red"
                size="md"
                px="xs"
                leftSection={<IconBackspace size={18} />}
                onClick={backspace}
              >
                Backspace
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
