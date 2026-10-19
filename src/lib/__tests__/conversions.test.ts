import { describe, expect, it } from "vitest";
import { decodeFromBraille, encodeToBraille } from "../braille";
import { decodeFromMorse, encodeToMorse } from "../morse";
import {
  decodeFromSemaphorePositions,
  encodeToSemaphore,
  parseSemaphorePairs,
} from "../semaphore";

describe("braille", () => {
  it("round-trips letters, digits, and punctuation", () => {
    const text = "hello, world 42!";
    expect(decodeFromBraille(encodeToBraille(text))).toBe(text);
  });

  it("prefixes each run of digits with a single number sign", () => {
    expect(encodeToBraille("12 3")).toBe("⠼⠁⠃ ⠼⠉");
    expect(encodeToBraille("12", { includeNumberSign: false })).toBe("⠁⠃");
  });

  it("leaves number mode when a non-digit cell follows", () => {
    // ⠼⠁⠃ = "12", then ⠅ (k) has no digit meaning
    expect(decodeFromBraille("⠼⠁⠃⠅")).toBe("12k");
  });

  it("applies the capital sign to the next letter only", () => {
    const encoded = encodeToBraille("Hi", { includeCapitalSign: true });
    expect(encoded).toBe("⠠⠓⠊");
    expect(decodeFromBraille(encoded)).toBe("Hi");
  });

  it("decodes dot-number notation in any order or separator style", () => {
    expect(decodeFromBraille("125 15 123 321 1-3-5")).toBe("hello");
    expect(decodeFromBraille("3456 1 12 / 1")).toBe("12 a");
    expect(decodeFromBraille("125 99")).toBe("h?");
  });
});

describe("morse", () => {
  it("round-trips text across words and lines", () => {
    const text = "sos at 9\nhelp?";
    expect(decodeFromMorse(encodeToMorse(text))).toBe(text);
  });

  it("uses the configured separators", () => {
    expect(
      encodeToMorse("ab c", { letterSeparator: "|", wordSeparator: "  " }),
    ).toBe(".-|-...  -.-.");
  });

  it("accepts alternative word separators and dot/dash glyphs", () => {
    expect(decodeFromMorse("•••  ——— | ···")).toBe("s o s");
    expect(decodeFromMorse("...---...")).toBe("?");
  });
});

describe("semaphore", () => {
  it("round-trips text with digits and spaces", () => {
    const encoded = encodeToSemaphore("Agent 007");
    expect(decodeFromSemaphorePositions(encoded.map((e) => e.positions))).toBe(
      "AGENT 007",
    );
  });

  it("treats arm order as irrelevant when decoding", () => {
    expect(
      decodeFromSemaphorePositions([
        [1, 0],
        [0, 1],
      ]),
    ).toBe("AA");
  });

  it("only reads digits after a number sign, until a non-digit signal", () => {
    // "J" (4,6) is not a digit, so it exits number mode
    expect(
      decodeFromSemaphorePositions([
        [0, 1],
        [4, 5],
        [0, 1],
        [4, 6],
        [0, 1],
      ]),
    ).toBe("A1JA");
  });

  it("parses pair tokens with mixed separators", () => {
    expect(parseSemaphorePairs("0,1 0-2 / 0:3 junk 9,10")).toEqual([
      [0, 1],
      [0, 2],
      [0, 0],
      [0, 3],
      [1, 2],
    ]);
  });
});
