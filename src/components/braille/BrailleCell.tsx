import { Paper } from "@mantine/core";

const DIMENSIONS = {
  sm: { width: 36, height: 52, dotSize: 8, pad: 6 },
  md: { width: 52, height: 76, dotSize: 12, pad: 8 },
  lg: { width: 72, height: 104, dotSize: 18, pad: 12 },
};

// Standard cell layout: dots 1-3 down the left column, 4-6 down the right.
const DOT_ROWS = [
  [1, 4],
  [2, 5],
  [3, 6],
];

export function BrailleCell({
  dots,
  interactive = false,
  onToggleDot,
  size = "md",
}: {
  dots: number[];
  interactive?: boolean;
  onToggleDot?: (dot: number) => void;
  size?: keyof typeof DIMENSIONS;
}) {
  const { width, height, dotSize, pad } = DIMENSIONS[size];

  return (
    <Paper
      withBorder
      p={pad}
      radius="md"
      w={width}
      h={height}
      bg={interactive ? "var(--mantine-color-gray-0)" : "transparent"}
      shadow={interactive ? "xs" : undefined}
      className="flex flex-col justify-between"
    >
      {DOT_ROWS.map((row) => (
        <div key={row[0]} className="flex justify-between">
          {row.map((dot) => {
            const active = dots.includes(dot);
            return (
              <button
                key={dot}
                type="button"
                disabled={!interactive}
                onClick={() => onToggleDot?.(dot)}
                aria-label={`Braille dot ${dot}`}
                aria-pressed={active}
                className={`rounded-full p-0 transition-all duration-150 ${
                  interactive ? "cursor-pointer" : ""
                } ${active && interactive ? "scale-110" : ""}`}
                style={{
                  width: dotSize,
                  height: dotSize,
                  border: active
                    ? "none"
                    : "1.5px solid var(--mantine-color-gray-4)",
                  backgroundColor: active
                    ? "var(--mantine-color-blue-6)"
                    : `var(--mantine-color-gray-${interactive ? 1 : 2})`,
                }}
              />
            );
          })}
        </div>
      ))}
    </Paper>
  );
}
