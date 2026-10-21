import type { ReferenceItem } from "../components/tools/ReferenceTable";

/** 0 = arm down, increasing clockwise (as seen facing the signaller) in 45° steps. */
export type SemaphoreDirection = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type SemaphorePair = [SemaphoreDirection, SemaphoreDirection];

export interface SemaphoreReferenceItem extends ReferenceItem {
  positions: SemaphorePair;
}

export const DIRECTION_NAMES: Record<SemaphoreDirection, string> = {
  0: "South (6:00 / Down)",
  1: "South-West (7:30 / Down-Left)",
  2: "West (9:00 / Left)",
  3: "North-West (10:30 / Up-Left)",
  4: "North (12:00 / Up)",
  5: "North-East (1:30 / Up-Right)",
  6: "East (3:00 / Right)",
  7: "South-East (4:30 / Down-Right)",
};

/** Clockwise degrees from north. */
export const directionAngle = (dir: SemaphoreDirection) =>
  (180 + dir * 45) % 360;

const REST: SemaphorePair = [0, 0];
const NUMBER_SIGN: SemaphorePair = [4, 5];

const SEMAPHORE_LETTERS: Record<string, SemaphorePair> = {
  a: [0, 1],
  b: [0, 2],
  c: [0, 3],
  d: [0, 4],
  e: [0, 5],
  f: [0, 6],
  g: [0, 7],
  h: [1, 2],
  i: [1, 3],
  j: [4, 6],
  k: [1, 4],
  l: [1, 5],
  m: [1, 6],
  n: [1, 7],
  o: [3, 7],
  p: [2, 4],
  q: [2, 5],
  r: [2, 6],
  s: [2, 7],
  t: [3, 4],
  u: [3, 5],
  v: [4, 7],
  w: [5, 6],
  x: [5, 7],
  y: [3, 6],
  z: [6, 7],
};

// Digits 1-9,0 reuse the signals for letters A-I,K.
const SEMAPHORE_DIGITS: Record<string, SemaphorePair> = Object.fromEntries(
  "1234567890".split("").map((d, i) => [d, SEMAPHORE_LETTERS["abcdefghik"[i]]]),
);

const pairKey = ([a, b]: SemaphorePair) => (a < b ? `${a},${b}` : `${b},${a}`);

const invert = (table: Record<string, SemaphorePair>) =>
  new Map(Object.entries(table).map(([c, pair]) => [pairKey(pair), c]));

const PAIR_TO_LETTER = invert(SEMAPHORE_LETTERS);
const PAIR_TO_DIGIT = invert(SEMAPHORE_DIGITS);

export const SEMAPHORE_REFERENCE_LIST: SemaphoreReferenceItem[] = [
  ...Object.entries(SEMAPHORE_LETTERS).map(([c, positions]) => ({
    char: c.toUpperCase(),
    positions,
    category: "letter" as const,
  })),
  ...Object.entries(SEMAPHORE_DIGITS).map(([char, positions]) => ({
    char,
    positions,
    category: "number" as const,
  })),
  { char: "# (Number Sign)", positions: NUMBER_SIGN, category: "special" },
  { char: "Rest / Space", positions: REST, category: "special" },
];

export interface SemaphoreSignal {
  id: string;
  char: string;
  positions: SemaphorePair;
}

export function encodeToSemaphore(
  text: string,
  includeNumberSign = true,
): SemaphoreSignal[] {
  const result: SemaphoreSignal[] = [];
  let inNumberMode = false;

  Array.from(text).forEach((ch, i) => {
    const digit = SEMAPHORE_DIGITS[ch];
    if (digit) {
      if (includeNumberSign && !inNumberMode) {
        result.push({ id: `${i}-#`, char: "#", positions: NUMBER_SIGN });
      }
      inNumberMode = true;
      result.push({ id: `${i}`, char: ch, positions: digit });
      return;
    }
    inNumberMode = false;

    if (/\s/.test(ch)) {
      result.push({ id: `${i}`, char: " ", positions: REST });
      return;
    }
    const letter = SEMAPHORE_LETTERS[ch.toLowerCase()];
    if (letter) {
      result.push({ id: `${i}`, char: ch.toUpperCase(), positions: letter });
    }
  });

  return result;
}

export const pairLabel = ([a, b]: SemaphorePair) => `${a},${b}`;

/** Text form of signals, e.g. "0,1 0,2 / 0,3", as accepted by `decodeFromSemaphore`. */
export const semaphoreSignalsToCode = (signals: SemaphoreSignal[]) =>
  signals.map((s) => (s.char === " " ? "/" : pairLabel(s.positions))).join(" ");

/** Parses tokens like "0,1 0-2 0:3", where "/" or "|" denotes a space. */
export function parseSemaphorePairs(input: string): SemaphorePair[] {
  const pairs: SemaphorePair[] = [];
  for (const token of input.trim().split(/\s+/)) {
    if (token === "/" || token === "|") {
      pairs.push(REST);
      continue;
    }
    const [a, b] = token.split(/[,:-]/).map(Number);
    if (Number.isInteger(a) && Number.isInteger(b)) {
      pairs.push([
        (a % 8) as SemaphoreDirection,
        (b % 8) as SemaphoreDirection,
      ]);
    }
  }
  return pairs;
}

export function decodeFromSemaphorePositions(pairs: SemaphorePair[]): string {
  let output = "";
  let isNumber = false;

  for (const pair of pairs) {
    const key = pairKey(pair);
    if (key === pairKey(REST)) {
      output += " ";
      isNumber = false;
      continue;
    }
    if (key === pairKey(NUMBER_SIGN)) {
      isNumber = true;
      continue;
    }
    if (isNumber) {
      const digit = PAIR_TO_DIGIT.get(key);
      if (digit) {
        output += digit;
        continue;
      }
      isNumber = false;
    }
    output += PAIR_TO_LETTER.get(key)?.toUpperCase() ?? "?";
  }

  return output;
}

export const decodeFromSemaphore = (code: string) =>
  decodeFromSemaphorePositions(parseSemaphorePairs(code));
