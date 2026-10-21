import { Box, Button, Checkbox, Flex, SimpleGrid, Text } from "@mantine/core";
import { useTimeout } from "@mantine/hooks";
import { IconBackspace } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { SemaphorePerson } from "../components/semaphore/SemaphorePerson";
import { ReferenceTable } from "../components/tools/ReferenceTable";
import { SymbolTile, ToolView } from "../components/tools/ToolView";
import {
  setting,
  toolRouteOptions,
  useToolState,
} from "../components/tools/toolUrlState";
import {
  DIRECTION_NAMES,
  decodeFromSemaphore,
  decodeFromSemaphorePositions,
  encodeToSemaphore,
  pairLabel,
  SEMAPHORE_REFERENCE_LIST,
  type SemaphoreDirection,
  type SemaphorePair,
  semaphoreSignalsToCode,
} from "../lib/semaphore";

export const Route = createFileRoute("/semaphore/{-$tab}")({
  ...toolRouteOptions({ num: setting(z.boolean(), true) }),
  component: SemaphorePage,
});

// The decode side always marks digits, or they'd decode as letters.
const encode = (text: string) =>
  semaphoreSignalsToCode(encodeToSemaphore(text));

function SemaphorePage() {
  const { search, update, text, code, setText, setCode } = useToolState(
    Route.useSearch(),
    encode,
    decodeFromSemaphore,
  );
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
    setCode(code ? `${code} ${pairLabel(pair)}` : pairLabel(pair));
  };

  // A half-picked signal is discarded before any committed token.
  const backspace = () => {
    stopFlash();
    if (firstArm !== null) {
      setFirstArm(null);
      return;
    }
    setCode(code.trimEnd().replace(/\S+$/, "").trimEnd());
  };

  const encoded = encodeToSemaphore(text, search.num);
  const flashChar = flash && decodeFromSemaphorePositions([flash]);
  // The number sign decodes to "" and rest to " ", so give them visible labels.
  const flashLabel =
    flashChar === "" ? "#" : flashChar === " " ? "␣" : flashChar;

  return (
    <ToolView
      tool="/semaphore"
      encode={{
        input: text,
        onInputChange: setText,
        output: semaphoreSignalsToCode(encoded),
        sampleText: "SECRET SIGNAL",
        controls: (
          <Checkbox
            label="Include Number Prefix (# / Pos 4,5) for Digits"
            checked={search.num}
            onChange={(e) => update({ num: e.currentTarget.checked })}
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
        input: code,
        onInputChange: setCode,
        output: text,
        sampleText: "0,6 1,5 0,1 0,7 / 2,4 0,1 1,5",
        interactiveWidget: (
          <Flex
            gap="md"
            direction={{ base: "column", sm: "row" }}
            justify="center"
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
                onClick={() => setCode(code ? `${code} /` : "/")}
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
