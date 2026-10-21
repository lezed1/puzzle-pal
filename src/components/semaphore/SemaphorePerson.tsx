import { Paper } from "@mantine/core";
import {
  DIRECTION_NAMES,
  directionAngle,
  type SemaphoreDirection,
} from "#/lib/semaphore.ts";

const PIVOT = { x: 100, y: 90 };
const ARM_LENGTH = 40;
const FLAG_SIZE = 26;
const GUIDE_RADIUS = 82;
const DIRECTIONS: SemaphoreDirection[] = [0, 1, 2, 3, 4, 5, 6, 7];
const BODY_COLOR = "var(--pp-figure)";

/** Point `dist` from the shoulder pivot towards `dir`, plus the unit vector used. */
function polar(dir: SemaphoreDirection, dist: number) {
  const rad = (directionAngle(dir) * Math.PI) / 180;
  const sin = Math.sin(rad);
  const cos = Math.cos(rad);
  return { x: PIVOT.x + dist * sin, y: PIVOT.y - dist * cos, sin, cos };
}

function ArmWithFlag({ dir }: { dir: SemaphoreDirection }) {
  const hand = polar(dir, ARM_LENGTH);
  const tip = polar(dir, ARM_LENGTH + FLAG_SIZE);
  // Offset perpendicular to the arm gives the flag its width.
  const px = hand.cos * (FLAG_SIZE / 2);
  const py = hand.sin * (FLAG_SIZE / 2);
  const a = `${hand.x + px},${hand.y + py}`;
  const b = `${tip.x + px},${tip.y + py}`;
  const c = `${tip.x - px},${tip.y - py}`;
  const d = `${hand.x - px},${hand.y - py}`;

  return (
    <g>
      <line
        x1={PIVOT.x}
        y1={PIVOT.y}
        x2={hand.x}
        y2={hand.y}
        stroke={BODY_COLOR}
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      <line
        x1={hand.x}
        y1={hand.y}
        x2={tip.x}
        y2={tip.y}
        stroke={BODY_COLOR}
        strokeWidth="3"
      />
      <polygon
        points={`${a} ${b} ${c}`}
        fill="#FAB005"
        stroke="#E67700"
        strokeWidth="0.75"
      />
      <polygon
        points={`${a} ${c} ${d}`}
        fill="#FA5252"
        stroke="#E03131"
        strokeWidth="0.75"
      />
    </g>
  );
}

function DirectionGuide({
  dir,
  selected,
  onSelect,
}: {
  dir: SemaphoreDirection;
  selected: boolean;
  onSelect?: (dir: SemaphoreDirection) => void;
}) {
  const { x, y } = polar(dir, GUIDE_RADIUS);
  return (
    // biome-ignore lint/a11y/useSemanticElements: <button> is not valid inside <svg>
    <g
      role="button"
      tabIndex={0}
      aria-label={DIRECTION_NAMES[dir]}
      aria-pressed={selected}
      className="cursor-pointer not-focus-visible:outline-none"
      onClick={() => onSelect?.(dir)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onSelect?.(dir);
      }}
    >
      <line
        x1={PIVOT.x}
        y1={PIVOT.y}
        x2={x}
        y2={y}
        stroke="var(--pp-guide)"
        strokeWidth="1"
        strokeDasharray="2 2"
      />
      <circle
        cx={x}
        cy={y}
        r={selected ? 11 : 9}
        fill={selected ? "var(--mantine-color-blue-6)" : "var(--pp-dot-off)"}
        stroke={
          selected ? "var(--mantine-color-blue-8)" : "var(--pp-dot-off-border)"
        }
        strokeWidth="1.5"
        className="transition-all duration-150"
      />
      <text
        x={x}
        y={y + 3.5}
        textAnchor="middle"
        fill={selected ? "#fff" : "var(--mantine-color-text)"}
        fontSize="10"
        fontWeight="bold"
        className="pointer-events-none select-none"
      >
        {dir}
      </text>
    </g>
  );
}

export function SemaphorePerson({
  positions,
  interactive = false,
  onSelectPosition,
  size = 140,
}: {
  positions: SemaphoreDirection[];
  interactive?: boolean;
  onSelectPosition?: (dir: SemaphoreDirection) => void;
  size?: number;
}) {
  return (
    <Paper
      withBorder
      p="xs"
      radius="md"
      bg={interactive ? "var(--pp-surface)" : "transparent"}
      shadow={interactive ? "xs" : undefined}
    >
      <svg
        // The guide circle has no body below it, so center the viewBox on the pivot.
        viewBox={`0 ${interactive ? PIVOT.y - 100 : 0} 200 200`}
        width={size}
        height={size}
        className="overflow-visible"
        role="img"
      >
        <title>Semaphore signal</title>
        {interactive &&
          DIRECTIONS.map((dir) => (
            <DirectionGuide
              key={dir}
              dir={dir}
              selected={positions.includes(dir)}
              onSelect={onSelectPosition}
            />
          ))}

        {!interactive && (
          <>
            <g stroke={BODY_COLOR} strokeLinecap="round">
              <line x1="100" y1="135" x2="84" y2="180" strokeWidth="4" />
              <line x1="100" y1="135" x2="116" y2="180" strokeWidth="4" />
              <line x1="100" y1="80" x2="100" y2="135" strokeWidth="6" />
            </g>
            <circle cx="100" cy="65" r="12" fill={BODY_COLOR} />
          </>
        )}

        {[...new Set(positions)].map((dir) => (
          <ArmWithFlag key={dir} dir={dir} />
        ))}
      </svg>
    </Paper>
  );
}
