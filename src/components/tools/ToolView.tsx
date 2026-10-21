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
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  IconCheck,
  IconCopy,
  IconEraser,
  IconSparkles,
} from "@tabler/icons-react";
import { useNavigate, useParams } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { TOOLS } from "../layout/AppLayout";
import type { ToolMode, ToolState } from "./toolUrlState";

export interface ToolViewProps {
  tool: (typeof TOOLS)[number]["to"];
  state: ToolState;
  sampleText: string;
  /** Encoded text, shown under the encode input. */
  output: string;
  /** Encode settings, shown under the encode input. */
  controls?: ReactNode;
  visualOutput?: ReactNode;
  /** Input widget shown above the decode input. */
  builder?: ReactNode;
  decodePlaceholder?: string;
  reference: ReactNode;
}

/** The mode is the route's optional `{-$tab}` segment; encode is the bare tool path. */
export function ToolView({
  tool,
  state: { text, code, setText, setCode },
  sampleText,
  output,
  controls,
  visualOutput,
  builder,
  decodePlaceholder = "Enter symbols or tokens to decode...",
  reference,
}: ToolViewProps) {
  const mode = useParams({ strict: false }).tab ?? "encode";
  const navigate = useNavigate();
  const setMode = (tab: ToolMode) =>
    navigate({
      to: `${tool}/{-$tab}`,
      params: { tab: tab === "encode" ? undefined : tab },
      search: true,
    });
  // biome-ignore lint/style/noNonNullAssertion: `tool` is typed to TOOLS paths
  const { label, icon: Icon, color } = TOOLS.find((t) => t.to === tool)!;

  return (
    <Stack gap="md">
      <Paper withBorder p="sm" radius="md">
        <Group justify="space-between" wrap="wrap" gap="sm">
          <Group gap="xs">
            <ThemeIcon size={36} radius="md" color={color} variant="light">
              <Icon size={22} />
            </ThemeIcon>
            <Title order={2} size="h3">
              {label}
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
          <InputCard
            value={text}
            onChange={setText}
            onSample={() => setText(sampleText)}
            controls={controls}
            placeholder="Enter text to encode..."
          />
          <OutputCard title="Output" value={output}>
            {visualOutput && (
              <Group gap={8} mt="sm" align="flex-end">
                {visualOutput}
              </Group>
            )}
          </OutputCard>
        </>
      )}

      {mode === "decode" && (
        <>
          {builder && (
            <Card withBorder radius="md" p="md">
              <Text fw={600} size="sm" mb="xs">
                Interactive Builder
              </Text>
              {builder}
            </Card>
          )}
          <InputCard
            value={code}
            onChange={setCode}
            onSample={() => setText(sampleText)}
            placeholder={decodePlaceholder}
          />
          <OutputCard title="Decoded Text" value={text} />
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
  value,
  onChange,
  onSample,
  controls,
  placeholder,
}: {
  value: string;
  onChange: (val: string) => void;
  onSample: () => void;
  controls?: ReactNode;
  placeholder: string;
}) {
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
            onClick={onSample}
          >
            Sample
          </Button>
          <Button
            variant="subtle"
            color="gray"
            size="xs"
            leftSection={<IconEraser size={14} />}
            onClick={() => onChange("")}
            disabled={!value}
          >
            Clear
          </Button>
        </Group>
      </Group>
      <Textarea
        placeholder={placeholder}
        size="md"
        minRows={3}
        maxRows={8}
        autosize
        value={value}
        onChange={(e) => onChange(e.currentTarget.value)}
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
    <Card withBorder radius="md" p="md" bg="var(--pp-surface)">
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
          fz={18}
          mih={40}
          className="whitespace-pre-wrap"
          c={value ? undefined : "dimmed"}
        >
          {/* Inline-block tokens stop browsers line-breaking after "-" mid Morse letter. */}
          {value
            ? value.split(/(\s+)/).map((token, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: tokens are derived and never reordered
                <span key={i} className="inline-block max-w-full wrap-anywhere">
                  {token}
                </span>
              ))
            : "—"}
        </Text>
      </Paper>
      {children}
    </Card>
  );
}
