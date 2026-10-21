import { useDebouncedCallback } from "@mantine/hooks";
import { notFound } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { TOOL_MODES, type ToolMode } from "./ToolView";

/** Route `params` config for a tool's optional `{-$tab}` segment. */
export const tabParams = {
  parse: ({ tab }: { tab?: string }) => {
    if (tab !== undefined && !TOOL_MODES.includes(tab as ToolMode))
      throw notFound();
    return { tab: tab as ToolMode | undefined };
  },
};

/** `code` is set only when the decode side was last edited, so its raw input survives reloads. */
export interface TextDraft {
  text: string;
  code?: string;
}

// The default search parser JSON-decodes values, so "123" arrives as a number.
export const parseTextSearch = (
  s: Record<string, unknown>,
  defaultText: string,
): TextDraft => ({
  text: s.text == null ? defaultText : String(s.text),
  code: s.code == null ? undefined : String(s.code),
});

/**
 * Keeps text in local state and writes it to the URL debounced: navigation runs in a React
 * transition, which would make a URL-controlled textarea lag and jump its cursor.
 */
export function useTextDraft(
  url: TextDraft,
  write: (d: TextDraft) => void,
  decode: (code: string) => string,
) {
  const [draft, setDraft] = useState<TextDraft>(url);
  const written = useRef(draft);
  const commit = useDebouncedCallback((d: TextDraft) => {
    written.current = d;
    write(d);
  }, 300);
  const edit = (d: TextDraft) => {
    setDraft(d);
    commit(d);
  };
  // Adopt URL changes we didn't make ourselves (back/forward).
  useEffect(() => {
    const { text, code } = written.current;
    if (url.text !== text || url.code !== code) {
      written.current = { text: url.text, code: url.code };
      setDraft(written.current);
    }
  }, [url.text, url.code]);

  return {
    draft,
    setText: (text: string) => edit({ text, code: undefined }),
    setCode: (code: string) => edit({ text: decode(code), code }),
  };
}
