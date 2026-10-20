import {
  ActionIcon,
  AppShell,
  Burger,
  Button,
  Container,
  Group,
  NavLink,
  Stack,
  Title,
  useMantineColorScheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconDots,
  IconFlag,
  IconMoon,
  IconRadio,
  IconSun,
} from "@tabler/icons-react";
import { Link, useLocation } from "@tanstack/react-router";
import type { ReactNode } from "react";

export const TOOLS = [
  {
    label: "Braille",
    to: "/braille",
    icon: IconDots,
    color: "blue",
    summary: "6-Dot Cells & Unicode",
  },
  {
    label: "Semaphore",
    to: "/semaphore",
    icon: IconFlag,
    color: "orange",
    summary: "8-Direction Angles & Positions",
  },
  {
    label: "Morse Code",
    to: "/morse",
    icon: IconRadio,
    color: "teal",
    summary: "Dots, Dashes & Tap Input",
  },
] as const;
export function AppLayout({ children }: { children: ReactNode }) {
  const [opened, { toggle, close }] = useDisclosure(false);
  const currentPath = useLocation({ select: (l) => l.pathname });
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  return (
    <AppShell
      header={{ height: 56 }}
      navbar={{
        width: 240,
        breakpoint: "sm",
        collapsed: { desktop: true, mobile: !opened },
      }}
    >
      <AppShell.Header>
        <Container size="lg" h="100%">
          <Group h="100%" justify="space-between" align="center">
            <Group gap="xs">
              <Burger
                opened={opened}
                onClick={toggle}
                hiddenFrom="sm"
                size="sm"
                aria-label="Toggle navigation menu"
              />
              <Link
                to="/"
                onClick={close}
                className="flex items-center gap-2 text-inherit no-underline"
              >
                <span className="text-[22px] leading-none">🧩</span>
                <Title order={3} size="h4" lh={1}>
                  Puzzle Pal
                </Title>
              </Link>
            </Group>

            <Group gap="xs" visibleFrom="sm">
              {TOOLS.map((item) => {
                const Icon = item.icon;
                const active = currentPath === item.to;
                return (
                  <Button
                    key={item.to}
                    component={Link}
                    to={item.to}
                    variant={active ? "light" : "subtle"}
                    color={active ? "blue" : "gray"}
                    leftSection={<Icon size={18} />}
                    size="xs"
                  >
                    {item.label}
                  </Button>
                );
              })}
            </Group>

            <ActionIcon
              variant="default"
              size="md"
              onClick={() => toggleColorScheme()}
              title="Toggle color scheme"
              aria-label="Toggle color scheme"
            >
              {colorScheme === "dark" ? (
                <IconSun size={16} />
              ) : (
                <IconMoon size={16} />
              )}
            </ActionIcon>
          </Group>
        </Container>
      </AppShell.Header>

      <AppShell.Navbar p="sm">
        <Stack gap="xs">
          {TOOLS.map((item) => {
            const Icon = item.icon;
            const active = currentPath === item.to;
            return (
              <NavLink
                key={item.to}
                component={Link}
                to={item.to}
                label={item.label}
                leftSection={<Icon size={18} />}
                active={active}
                onClick={close}
              />
            );
          })}
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>
        <Container size="lg" py="md">
          {children}
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
