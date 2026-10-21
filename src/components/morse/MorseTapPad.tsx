import { Button, SimpleGrid } from "@mantine/core";

const KEYS: Array<{ label: string; apply: (prev: string) => string }> = [
  { label: "Dot  ·", apply: (prev) => `${prev}.` },
  { label: "Dash  –", apply: (prev) => `${prev}-` },
  { label: "Next Letter", apply: (prev) => `${prev} ` },
  { label: "Next Word  /", apply: (prev) => `${prev} / ` },
  { label: "⌫ Delete", apply: (prev) => prev.slice(0, -1) },
];

export function MorseTapPad({
  onChange,
}: {
  onChange: (update: (prev: string) => string) => void;
}) {
  return (
    <SimpleGrid cols={2} spacing="sm">
      {KEYS.map(({ label, apply }) => (
        <Button
          key={label}
          variant="light"
          color={label.startsWith("⌫") ? "red" : "blue"}
          className={label.startsWith("⌫") ? "col-span-2" : undefined}
          size="lg"
          h={72}
          px="xs"
          onClick={() => onChange(apply)}
        >
          {label}
        </Button>
      ))}
    </SimpleGrid>
  );
}
