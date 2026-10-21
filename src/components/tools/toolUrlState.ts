import { useDebouncedCallback } from "@mantine/hooks";
import {
  notFound,
  stripSearchParams,
  useNavigate,
} from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";

export const TOOL_MODES = ["encode", "decode", "reference"] as const;
export type ToolMode = (typeof TOOL_MODES)[number];

// Shared by every tool so text carries over unchanged when switching between them.
const DEFAULT_TEXT = "PUZZLE PAL";

/** A search param that falls back to `value` when missing or invalid. */
export const setting = <T extends z.ZodType>(
  schema: T,
  value: z.util.NoUndefined<z.output<T>>,
) => schema.default(value).catch(value);

/**
 * Route options shared by every tool: the optional `{-$tab}` segment, plus a plain-text
 * `text` search param alongside the tool's own settings, with defaults stripped from the URL.
 */
export function toolRouteOptions<T extends z.ZodRawShape>(settings: T) {
  const schema = z.object({
    // The default search parser JSON-decodes values, so "123" arrives as a number.
    text: setting(z.coerce.string(), DEFAULT_TEXT),
    ...settings,
  });
  return {
    params: {
      parse: ({ tab }: { tab?: string }) => {
        if (tab !== undefined && !TOOL_MODES.includes(tab as ToolMode))
          throw notFound();
        return { tab: tab as ToolMode | undefined };
      },
    },
    validateSearch: schema,
    search: {
      middlewares: [
        stripSearchParams<z.output<typeof schema>>(schema.parse({})),
      ],
    },
  };
}

/** `code` is the raw decode input, kept only locally; the URL holds just the plain text. */
interface TextDraft {
  text: string;
  code?: string;
}

/**
 * URL-backed tool state. Text is held locally and written to the URL debounced: navigation
 * runs in a React transition, which would make a URL-controlled textarea lag and jump its
 * cursor, and Safari throttles rapid `replaceState` calls.
 */
export function useToolState<S extends { text: string }>(
  search: S,
  encode: (text: string) => string,
  decode: (code: string) => string,
) {
  const navigate = useNavigate();
  const update = (patch: Partial<S>) =>
    navigate({
      to: ".",
      search: (prev) => ({ ...prev, ...patch }),
      replace: true,
    });

  const [draft, setDraft] = useState<TextDraft>({ text: search.text });
  const written = useRef(search.text);
  const commit = useDebouncedCallback((text: string) => {
    written.current = text;
    update({ text } as Partial<S>);
  }, 300);
  const edit = (d: TextDraft) => {
    setDraft(d);
    commit(d.text);
  };
  // Adopt URL changes we didn't make ourselves (back/forward).
  useEffect(() => {
    if (search.text !== written.current) {
      written.current = search.text;
      setDraft({ text: search.text });
    }
  }, [search.text]);

  return {
    search,
    update,
    text: draft.text,
    code: draft.code ?? encode(draft.text),
    setText: (text: string) => edit({ text }),
    setCode: (code: string) => edit({ text: decode(code), code }),
  };
}
