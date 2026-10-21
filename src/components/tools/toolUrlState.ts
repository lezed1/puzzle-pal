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

/** A search param that falls back to `value` when missing or invalid. */
export const setting = <T extends z.ZodType>(
  schema: T,
  value: z.util.NoUndefined<z.output<T>>,
) => schema.default(value).catch(value);

/**
 * Route options shared by every tool: the optional `{-$tab}` segment, plus search params
 * `text` and `code` alongside the tool's own settings, with defaults stripped from the URL.
 * `code` is set only when the decode side was last edited, so its raw input survives reloads.
 */
export function toolRouteOptions<T extends z.ZodRawShape>(
  defaultText: string,
  settings: T,
) {
  const schema = z.object({
    // The default search parser JSON-decodes values, so "123" arrives as a number.
    text: setting(z.coerce.string(), defaultText),
    code: z.coerce.string().optional().catch(undefined),
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

interface TextDraft {
  text: string;
  code?: string;
}

/**
 * URL-backed tool state. Text is held locally and written to the URL debounced: navigation
 * runs in a React transition, which would make a URL-controlled textarea lag and jump its
 * cursor, and Safari throttles rapid `replaceState` calls.
 */
export function useToolState<S extends TextDraft>(
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

  const [draft, setDraft] = useState<TextDraft>(search);
  const written = useRef(draft);
  const commit = useDebouncedCallback((d: TextDraft) => {
    written.current = d;
    update(d as Partial<S>);
  }, 300);
  const edit = (d: TextDraft) => {
    setDraft(d);
    commit(d);
  };
  // Adopt URL changes we didn't make ourselves (back/forward).
  useEffect(() => {
    const { text, code } = written.current;
    if (search.text !== text || search.code !== code) {
      written.current = { text: search.text, code: search.code };
      setDraft(written.current);
    }
  }, [search.text, search.code]);

  return {
    search,
    update,
    text: draft.text,
    code: draft.code ?? encode(draft.text),
    setText: (text: string) => edit({ text, code: undefined }),
    setCode: (code: string) => edit({ text: decode(code), code }),
  };
}
