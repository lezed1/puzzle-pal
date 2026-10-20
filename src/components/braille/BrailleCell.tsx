import { Paper } from "@mantine/core";

const DIMENSIONS = {
  sm: { width: 36, height: 52, dotSize: 8, pad: 6 },
  md: { width: 52, height: 76, dotSize: 12, pad: 8 },
  lg: { width: 72, height: 104, dotSize: 18, pad: 12 },
  xl: { width: 136, height: 200, dotSize: 46, pad: 16 },
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
      bg={interactive ? "var(--pp-surface)" : "transparent"}
      shadow={interactive ? "xs" : undefined}
      className="flex shrink-0 flex-col justify-between"
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
                className={`flex items-center justify-center rounded-full p-0 font-bold transition-all duration-150 ${
                  interactive ? "cursor-pointer" : ""
                } ${active && interactive ? "scale-110" : ""}`}
                style={{
                  width: dotSize,
                  height: dotSize,
                  fontSize: dotSize / 2.5,
                  color: active ? "white" : "var(--mantine-color-dimmed)",
                  border: active
                    ? "none"
                    : "1.5px solid var(--pp-dot-off-border)",
                  backgroundColor: active
                    ? "var(--mantine-color-blue-6)"
                    : "var(--pp-dot-off)",
                }}
              >
                {interactive && dot}
              </button>
            );
          })}
        </div>
      ))}
    </Paper>
  );
}
