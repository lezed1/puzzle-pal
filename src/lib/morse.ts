import type { ReferenceItem } from "../components/tools/ReferenceTable";

export interface MorseReferenceItem extends ReferenceItem {
  morse: string;
}

const MORSE_TABLE: Record<string, string> = {
  // Letters
  a: ".-",
  b: "-...",
  c: "-.-.",
  d: "-..",
  e: ".",
  f: "..-.",
  g: "--.",
  h: "....",
  i: "..",
  j: ".---",
  k: "-.-",
  l: ".-..",
  m: "--",
  n: "-.",
  o: "---",
  p: ".--.",
  q: "--.-",
  r: ".-.",
  s: "...",
  t: "-",
  u: "..-",
  v: "...-",
  w: ".--",
  x: "-..-",
  y: "-.--",
  z: "--..",

  // Numbers
  "1": ".----",
  "2": "..---",
  "3": "...--",
  "4": "....-",
  "5": ".....",
  "6": "-....",
  "7": "--...",
  "8": "---..",
  "9": "----.",
  "0": "-----",

  // Punctuation & Signs
  ".": ".-.-.-",
  ",": "--..--",
  "?": "..--..",
  "'": ".----.",
  "!": "-.-.--",
  "/": "-..-.",
  "(": "-.--.",
  ")": "-.--.-",
  "&": ".-...",
  ":": "---...",
  ";": "-.-.-.",
  "=": "-...-",
  "+": ".-.-.",
  "-": "-....-",
  _: "..--.-",
  '"': ".-..-.",
  $: "...-..-",
  "@": ".--.-.",
};

const MORSE_REVERSE_TABLE: Record<string, string> = Object.fromEntries(
  Object.entries(MORSE_TABLE).map(([char, code]) => [code, char]),
);

// Table order is letters, digits, punctuation, so no sorting is needed.
export const MORSE_REFERENCE_LIST: MorseReferenceItem[] = Object.entries(
  MORSE_TABLE,
).map(([c, morse]) => ({
  char: c.toUpperCase(),
  morse,
  category: /[a-z]/.test(c)
    ? "letter"
    : /[0-9]/.test(c)
      ? "number"
      : "punctuation",
}));

export interface MorseEncodeOptions {
  letterSeparator?: string;
  wordSeparator?: string;
}

export function encodeToMorse(
  text: string,
  { letterSeparator = " ", wordSeparator = " / " }: MorseEncodeOptions = {},
): string {
  return text
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return "";
      return trimmed
        .split(/\s+/)
        .map((word) =>
          Array.from(word, (ch) => MORSE_TABLE[ch.toLowerCase()] ?? ch).join(
            letterSeparator,
          ),
        )
        .join(wordSeparator);
    })
    .join("\n");
}

/** Accepts "/", "|" or 2+ spaces between words; also normalises •·—–_ to dots/dashes. */
export function decodeFromMorse(morseText: string): string {
  return morseText
    .split("\n")
    .map((line) => {
      const cleaned = line.replace(/[•·]/g, ".").replace(/[—–_]/g, "-").trim();
      if (!cleaned) return "";
      return cleaned
        .split(/\s*[/|]\s*|\s{2,}/)
        .map((word) =>
          word
            .split(/\s+/)
            .map((token) => (token ? (MORSE_REVERSE_TABLE[token] ?? "?") : ""))
            .join(""),
        )
        .join(" ");
    })
    .join("\n");
}
