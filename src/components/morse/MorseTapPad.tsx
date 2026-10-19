import { Button, Group } from "@mantine/core";

const KEYS: Array<{ label: string; apply: (prev: string) => string }> = [
  { label: "Dot ( . )", apply: (prev) => `${prev}.` },
  { label: "Dash ( - )", apply: (prev) => `${prev}-` },
  { label: "Letter Space", apply: (prev) => `${prev} ` },
  { label: "Word Space ( / )", apply: (prev) => `${prev} / ` },
  { label: "⌫ Backspace", apply: (prev) => prev.slice(0, -1) },
];

export function MorseTapPad({
  onChange,
}: {
  onChange: (update: (prev: string) => string) => void;
}) {
  return (
    <Group gap="xs">
      {KEYS.map(({ label, apply }) => (
        <Button
          key={label}
          variant="light"
          color={label.startsWith("⌫") ? "red" : "blue"}
          size="xs"
          onClick={() => onChange(apply)}
        >
          {label}
        </Button>
      ))}
    </Group>
  );
}
