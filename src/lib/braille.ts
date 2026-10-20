import type { ReferenceItem } from "../components/tools/ReferenceTable";

export interface BrailleReferenceItem extends ReferenceItem {
  dots: number[];
  unicode: string;
  dotString: string;
}

export function dotsToUnicode(dots: number[]): string {
  let mask = 0;
  for (const d of dots) {
    if (d >= 1 && d <= 8) mask |= 1 << (d - 1);
  }
  return String.fromCharCode(0x2800 + mask);
}

export function unicodeToDots(char: string): number[] {
  const mask = char.charCodeAt(0) - 0x2800;
  if (mask < 0 || mask > 0xff) return [];
  const dots: number[] = [];
  for (let i = 0; i < 8; i++) {
    if (mask & (1 << i)) dots.push(i + 1);
  }
  return dots;
}

const NUMBER_SIGN_DOTS = [3, 4, 5, 6];
const CAPITAL_SIGN_DOTS = [6];
const NUMBER_SIGN_UNICODE = dotsToUnicode(NUMBER_SIGN_DOTS);
const CAPITAL_SIGN_UNICODE = dotsToUnicode(CAPITAL_SIGN_DOTS);

const BRAILLE_LETTERS: Record<string, number[]> = {
  a: [1],
  b: [1, 2],
  c: [1, 4],
  d: [1, 4, 5],
  e: [1, 5],
  f: [1, 2, 4],
  g: [1, 2, 4, 5],
  h: [1, 2, 5],
  i: [2, 4],
  j: [2, 4, 5],
  k: [1, 3],
  l: [1, 2, 3],
  m: [1, 3, 4],
  n: [1, 3, 4, 5],
  o: [1, 3, 5],
  p: [1, 2, 3, 4],
  q: [1, 2, 3, 4, 5],
  r: [1, 2, 3, 5],
  s: [2, 3, 4],
  t: [2, 3, 4, 5],
  u: [1, 3, 6],
  v: [1, 2, 3, 6],
  w: [2, 4, 5, 6],
  x: [1, 3, 4, 6],
  y: [1, 3, 4, 5, 6],
  z: [1, 3, 5, 6],
};

// Digits 1-9,0 reuse the cells of letters a-j.
const BRAILLE_DIGITS: Record<string, number[]> = Object.fromEntries(
  "1234567890".split("").map((d, i) => [d, BRAILLE_LETTERS["abcdefghij"[i]]]),
);

const BRAILLE_PUNCTUATION: Record<string, number[]> = {
  ",": [2],
  ";": [2, 3],
  ":": [2, 5],
  ".": [2, 5, 6],
  "!": [2, 3, 5],
  "?": [2, 3, 6],
  "'": [3],
  "-": [3, 6],
  "(": [2, 3, 5, 6],
  ")": [2, 3, 5, 6],
  "/": [3, 4],
  "@": [4],
};

const refItem = (
  char: string,
  dots: number[],
  category: BrailleReferenceItem["category"],
): BrailleReferenceItem => ({
  char,
  dots,
  unicode: dotsToUnicode(dots),
  dotString: dots.join("-"),
  category,
});

export const BRAILLE_REFERENCE_LIST: BrailleReferenceItem[] = [
  ...Object.entries(BRAILLE_LETTERS).map(([c, dots]) =>
    refItem(c.toUpperCase(), dots, "letter"),
  ),
  ...Object.entries(BRAILLE_DIGITS).map(([c, dots]) =>
    refItem(c, dots, "number"),
  ),
  refItem("Number Sign", NUMBER_SIGN_DOTS, "special"),
  refItem("Capital Sign", CAPITAL_SIGN_DOTS, "special"),
  ...Object.entries(BRAILLE_PUNCTUATION).map(([c, dots]) =>
    refItem(c, dots, "punctuation"),
  ),
];

const dotsKey = (dots: number[]) =>
  [...new Set(dots)].sort((a, b) => a - b).join(",");

const invert = (table: Record<string, number[]>) =>
  new Map(Object.entries(table).map(([c, dots]) => [dotsKey(dots), c]));

const DOTS_TO_LETTER = invert(BRAILLE_LETTERS);
const DOTS_TO_DIGIT = invert(BRAILLE_DIGITS);
const DOTS_TO_PUNCT = invert(BRAILLE_PUNCTUATION);
const NUMBER_SIGN_KEY = dotsKey(NUMBER_SIGN_DOTS);
const CAPITAL_SIGN_KEY = dotsKey(CAPITAL_SIGN_DOTS);

export interface BrailleEncodeOptions {
  includeNumberSign?: boolean;
  includeCapitalSign?: boolean;
}

export interface BrailleCellOutput {
  /** Source text this cell represents, e.g. "A", "1", or "#" for the number sign. */
  label: string;
  cell: string;
}

export function encodeToBrailleCells(
  text: string,
  {
    includeNumberSign = true,
    includeCapitalSign = false,
  }: BrailleEncodeOptions = {},
): BrailleCellOutput[] {
  const out: BrailleCellOutput[] = [];
  let inNumberMode = false;

  for (const ch of text) {
    if (/[0-9]/.test(ch)) {
      if (includeNumberSign && !inNumberMode)
        out.push({ label: "#", cell: NUMBER_SIGN_UNICODE });
      inNumberMode = true;
      out.push({ label: ch, cell: dotsToUnicode(BRAILLE_DIGITS[ch]) });
      continue;
    }
    inNumberMode = false;

    if (includeCapitalSign && /[A-Z]/.test(ch))
      out.push({ label: "CAP", cell: CAPITAL_SIGN_UNICODE });
    const dots = BRAILLE_LETTERS[ch.toLowerCase()] ?? BRAILLE_PUNCTUATION[ch];
    out.push({
      label: ch.toUpperCase(),
      cell: dots ? dotsToUnicode(dots) : ch,
    });
  }

  return out;
}

export const encodeToBraille = (text: string, options?: BrailleEncodeOptions) =>
  encodeToBrailleCells(text, options)
    .map((c) => c.cell)
    .join("");

/** Decodes Unicode braille, or dot-number tokens like "125 15" / "1-2-5 1-5" ("/" = space). */
export function decodeFromBraille(input: string): string {
  // A cell is either a separator string to emit verbatim, or a dot key plus fallback text.
  const cells: Array<string | { key: string; raw: string }> = [];

  if (/[\u2800-\u28FF]/.test(input)) {
    for (const ch of input) {
      if (ch === "\n") cells.push("\n");
      else if (/\s/.test(ch)) cells.push(" ");
      else cells.push({ key: dotsKey(unicodeToDots(ch)), raw: ch });
    }
  } else {
    for (const token of input.trim().split(/[\s,]+/)) {
      if (token === "/" || token === "|") cells.push(" ");
      else if (token) {
        const dots = token
          .replace(/[^1-8]/g, "")
          .split("")
          .map(Number);
        cells.push({ key: dotsKey(dots), raw: "?" });
      }
    }
  }

  let output = "";
  let isNumber = false;
  let isCapital = false;

  for (const cell of cells) {
    if (typeof cell === "string") {
      output += cell;
      isNumber = isCapital = false;
      continue;
    }
    const { key, raw } = cell;
    if (key === NUMBER_SIGN_KEY) {
      isNumber = true;
      continue;
    }
    if (key === CAPITAL_SIGN_KEY) {
      isCapital = true;
      continue;
    }
    if (isNumber) {
      const digit = DOTS_TO_DIGIT.get(key);
      if (digit) {
        output += digit;
        continue;
      }
      isNumber = false;
    }
    const letter = DOTS_TO_LETTER.get(key);
    output += letter
      ? isCapital
        ? letter.toUpperCase()
        : letter
      : (DOTS_TO_PUNCT.get(key) ?? raw);
    isCapital = false;
  }

  return output;
}
