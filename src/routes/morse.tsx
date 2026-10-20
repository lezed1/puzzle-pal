import { Badge, Group, Select } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MorseTapPad } from "../components/morse/MorseTapPad";
import { ReferenceTable } from "../components/tools/ReferenceTable";
import { ToolView } from "../components/tools/ToolView";
import {
  decodeFromMorse,
  encodeToMorse,
  MORSE_REFERENCE_LIST,
} from "../lib/morse";

export const Route = createFileRoute("/morse")({
  component: MorsePage,
});

function MorsePage() {
  const [encodeInput, setEncodeInput] = useState("SOS PUZZLE");
  const [letterSeparator, setLetterSeparator] = useState(" ");
  const [wordSeparator, setWordSeparator] = useState(" / ");
  const [decodeInput, setDecodeInput] = useState(
    "... --- ... / .--. ..- --.. --.. .-.. .",
  );

  return (
    <ToolView
      tool="/morse"
      encode={{
        input: encodeInput,
        onInputChange: setEncodeInput,
        output: encodeToMorse(encodeInput, { letterSeparator, wordSeparator }),
        sampleText: "MAYDAY SHIP SOS",
        controls: (
          <Group gap="md">
            <Select
              label="Letter Separator"
              size="xs"
              w={140}
              data={[
                { value: " ", label: "Space (' ')" },
                { value: "/", label: "Slash ('/')" },
                { value: "-", label: "Dash ('-')" },
              ]}
              value={letterSeparator}
              onChange={(val) => val && setLetterSeparator(val)}
            />
            <Select
              label="Word Separator"
              size="xs"
              w={160}
              data={[
                { value: " / ", label: "Slash (' / ')" },
                { value: " | ", label: "Pipe (' | ')" },
                { value: "   ", label: "3 Spaces ('   ')" },
              ]}
              value={wordSeparator}
              onChange={(val) => val && setWordSeparator(val)}
            />
          </Group>
        ),
      }}
      decode={{
        input: decodeInput,
        onInputChange: setDecodeInput,
        output: decodeFromMorse(decodeInput),
        sampleText: ".... . .-.. .-.. --- / .-- --- .-. .-.. -..",
        interactiveWidget: <MorseTapPad onChange={setDecodeInput} />,
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
