import { MantineProvider } from "@mantine/core";
import { TanStackDevtools } from "@tanstack/react-devtools";
import {
  createRootRoute,
  Outlet,
  retainSearchParams,
  stripSearchParams,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { z } from "zod";
import { AppLayout } from "../components/layout/AppLayout";
import { setting } from "../components/tools/toolUrlState";

import "../styles.css";

const DEFAULT_TEXT = "PUZZLE PAL";

export const Route = createRootRoute({
  // The plain text is shared by every tool and carried across navigations. The default
  // search parser JSON-decodes values, so "123" arrives as a number.
  validateSearch: z.object({ text: setting(z.coerce.string(), DEFAULT_TEXT) }),
  search: {
    middlewares: [
      retainSearchParams(["text"]),
      stripSearchParams({ text: DEFAULT_TEXT }),
    ],
  },
  component: RootComponent,
});

function RootComponent() {
  return (
    <MantineProvider defaultColorScheme="auto">
      <AppLayout>
        <Outlet />
      </AppLayout>
      <TanStackDevtools
        config={{
          position: "bottom-right",
        }}
        plugins={[
          {
            name: "TanStack Router",
            render: <TanStackRouterDevtoolsPanel />,
          },
        ]}
      />
    </MantineProvider>
  );
}
