import {
  Box,
  Card,
  Group,
  SegmentedControl,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { type ReactNode, useState } from "react";

export interface ReferenceItem {
  char: string;
  category: "letter" | "number" | "punctuation" | "special";
}

const CATEGORY_FILTERS = [
  { label: "All", value: "all" },
  { label: "Letters", value: "letter" },
  { label: "Numbers", value: "number" },
  { label: "Punctuation / Special", value: "other" },
];

const matchesCategory = (item: ReferenceItem, filter: string) =>
  filter === "all" ||
  item.category === filter ||
  (filter === "other" &&
    (item.category === "punctuation" || item.category === "special"));

export function ReferenceTable<T extends ReferenceItem>({
  items,
  renderSymbol,
}: {
  items: T[];
  /** Rendered below the character label in each card. */
  renderSymbol: (item: T) => ReactNode;
}) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const query = search.trim().toLowerCase();
  const filteredItems = items.filter(
    (item) =>
      item.char.toLowerCase().includes(query) &&
      matchesCategory(item, category),
  );

  return (
    <Box>
      <Group justify="space-between" mb="md" wrap="wrap" gap="sm">
        <TextInput
          placeholder="Search symbols..."
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          style={{ flexGrow: 1, maxWidth: 360 }}
        />
        <SegmentedControl
          size="xs"
          value={category}
          onChange={setCategory}
          data={CATEGORY_FILTERS}
        />
      </Group>

      {filteredItems.length === 0 ? (
        <Card withBorder p="xl" radius="md" ta="center">
          <Text c="dimmed">No symbols match "{search}".</Text>
        </Card>
      ) : (
        <SimpleGrid cols={{ base: 2, xs: 3, sm: 4, md: 6 }} spacing="sm">
          {filteredItems.map((item) => (
            <Card
              key={`${item.category}-${item.char}`}
              withBorder
              p="xs"
              radius="md"
              ta="center"
            >
              <Stack align="center" gap={4}>
                <Text fw={700} size="md">
                  {item.char}
                </Text>
                {renderSymbol(item)}
              </Stack>
            </Card>
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
}
