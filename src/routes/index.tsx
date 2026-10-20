import {
  Button,
  Card,
  Group,
  SimpleGrid,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { IconArrowRight } from "@tabler/icons-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { TOOLS } from "../components/layout/AppLayout";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
      {TOOLS.map(({ label, to, icon: Icon, color, summary }) => (
        <Card key={to} withBorder radius="md" p="md">
          <Group gap="sm" wrap="nowrap">
            <ThemeIcon size={40} radius="md" color={color} variant="light">
              <Icon size={24} />
            </ThemeIcon>
            <div>
              <Title order={3} size="h4">
                {label}
              </Title>
              <Text size="sm" c="dimmed">
                {summary}
              </Text>
            </div>
          </Group>
          <Button
            component={Link}
            to={to}
            mt="md"
            color={color}
            rightSection={<IconArrowRight size={16} />}
            fullWidth
          >
            Open {label}
          </Button>
        </Card>
      ))}
    </SimpleGrid>
  );
}
