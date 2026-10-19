import {
  Box,
  Button,
  Card,
  CopyButton,
  Group,
  Paper,
  SegmentedControl,
  Stack,
  Text,
  Textarea,
  Title,
} from "@mantine/core";
import {
  IconCheck,
  IconCopy,
  IconEraser,
  IconSparkles,
} from "@tabler/icons-react";
import { type ReactNode, useState } from "react";

type ToolMode = "encode" | "decode" | "reference";

interface PanelProps {
  input: string;
  onInputChange: (val: string) => void;
  output: string;
  sampleText: string;
  controls?: ReactNode;
}

export interface ToolViewProps {
  title: string;
  icon: ReactNode;
  encode: PanelProps & { visualOutput?: ReactNode };
  decode: PanelProps & { interactiveWidget?: ReactNode };
  reference: ReactNode;
}

export function ToolView({
  title,
  icon,
  encode,
  decode,
  reference,
}: ToolViewProps) {
  const [mode, setMode] = useState<ToolMode>("encode");

  return (
    <Stack gap="md">
      <Paper withBorder p="sm" radius="md">
        <Group justify="space-between" wrap="wrap" gap="sm">
          <Group gap="xs">
            <Box fz={24} lh={1}>
              {icon}
            </Box>
            <Title order={2} size="h3">
              {title}
            </Title>
          </Group>
          <SegmentedControl
            value={mode}
            onChange={(val) => setMode(val as ToolMode)}
            data={[
              { label: "Encode", value: "encode" },
              { label: "Decode", value: "decode" },
              { label: "Reference", value: "reference" },
            ]}
            size="xs"
            radius="sm"
          />
        </Group>
      </Paper>

      {mode === "encode" && (
        <>
          <InputCard {...encode} placeholder="Enter text to encode..." />
          <OutputCard title="Output" value={encode.output}>
            {encode.visualOutput && (
              <Group gap={8} mt="sm" align="flex-end">
                {encode.visualOutput}
              </Group>
            )}
          </OutputCard>
        </>
      )}

      {mode === "decode" && (
        <>
          {decode.interactiveWidget && (
            <Card withBorder radius="md" p="md">
              <Text fw={600} size="sm" mb="xs">
                Interactive Builder
              </Text>
              {decode.interactiveWidget}
            </Card>
          )}
          <InputCard
            {...decode}
            placeholder="Enter symbols or tokens to decode..."
          />
          <OutputCard title="Decoded Text" value={decode.output} />
        </>
      )}

      {mode === "reference" && reference}
    </Stack>
  );
}

/** A bordered tile for one symbol in the encode visual output. */
export function SymbolTile({
  minWidth,
  children,
}: {
  minWidth: number;
  children: ReactNode;
}) {
  return (
    <Paper withBorder p="xs" radius="sm" miw={minWidth}>
      <Stack align="center" gap={4}>
        {children}
      </Stack>
    </Paper>
  );
}

function InputCard({
  input,
  onInputChange,
  sampleText,
  controls,
  placeholder,
}: PanelProps & { placeholder: string }) {
  return (
    <Card withBorder radius="md" p="md">
      <Group justify="space-between" mb="xs">
        <Text fw={600} size="sm">
          Input
        </Text>
        <Group gap="xs">
          <Button
            variant="subtle"
            size="xs"
            leftSection={<IconSparkles size={14} />}
            onClick={() => onInputChange(sampleText)}
          >
            Sample
          </Button>
          <Button
            variant="subtle"
            color="gray"
            size="xs"
            leftSection={<IconEraser size={14} />}
            onClick={() => onInputChange("")}
            disabled={!input}
          >
            Clear
          </Button>
        </Group>
      </Group>
      <Textarea
        placeholder={placeholder}
        minRows={3}
        maxRows={8}
        autosize
        value={input}
        onChange={(e) => onInputChange(e.currentTarget.value)}
      />
      {controls && <Box mt="sm">{controls}</Box>}
    </Card>
  );
}

function OutputCard({
  title,
  value,
  children,
}: {
  title: string;
  value: string;
  children?: ReactNode;
}) {
  return (
    <Card withBorder radius="md" p="md" bg="var(--mantine-color-gray-0)">
      <Group justify="space-between" mb="xs">
        <Text fw={600} size="sm">
          {title}
        </Text>
        <CopyButton value={value} timeout={2000}>
          {({ copied, copy }) => (
            <Button
              size="xs"
              color={copied ? "teal" : "blue"}
              variant="light"
              leftSection={
                copied ? <IconCheck size={14} /> : <IconCopy size={14} />
              }
              onClick={copy}
              disabled={!value}
            >
              {copied ? "Copied" : "Copy"}
            </Button>
          )}
        </CopyButton>
      </Group>
      <Paper withBorder p="sm" radius="sm" bg="var(--mantine-color-body)">
        <Text
          ff="monospace"
          fz={16}
          mih={40}
          className="whitespace-pre-wrap break-words"
          c={value ? undefined : "dimmed"}
        >
          {value || "—"}
        </Text>
      </Paper>
      {children}
    </Card>
  );
}
