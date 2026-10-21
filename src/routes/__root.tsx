import { MantineProvider } from "@mantine/core";
import { TanStackDevtools } from "@tanstack/react-devtools";
import {
  createRootRoute,
  Outlet,
  retainSearchParams,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { z } from "zod";
import { AppLayout } from "../components/layout/AppLayout";

import "../styles.css";

export const Route = createRootRoute({
  // Carry the plain text across every navigation, so switching tools keeps it.
  validateSearch: z.object({ text: z.coerce.string().optional() }),
  search: { middlewares: [retainSearchParams(["text"])] },
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
