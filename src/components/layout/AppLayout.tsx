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
import { Link, useLocation, useParams } from "@tanstack/react-router";
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
  // Keep the encode/decode/reference tab when switching tools.
  const tab = useParams({ strict: false, select: (p) => p.tab });
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const links = TOOLS.map(({ to, label, icon: Icon }) => ({
    key: to,
    to: tab ? `${to}/${tab}` : to,
    label,
    icon: <Icon size={18} />,
    active: currentPath.startsWith(to),
  }));

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
              {links.map(({ key, to, label, icon, active }) => (
                <Button
                  key={key}
                  component={Link}
                  to={to}
                  variant={active ? "light" : "subtle"}
                  color={active ? "blue" : "gray"}
                  leftSection={icon}
                  size="xs"
                >
                  {label}
                </Button>
              ))}
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
          {links.map(({ key, to, label, icon, active }) => (
            <NavLink
              key={key}
              component={Link}
              to={to}
              label={label}
              leftSection={icon}
              active={active}
              onClick={close}
            />
          ))}
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
