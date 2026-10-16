import type { Meta, StoryObj } from "@storybook/react-vite";
import { FilterBar } from ".";

const meta = {
  component: FilterBar,
  tags: ["autodocs"],
} satisfies Meta<typeof FilterBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    filters: [
      { label: "All", count: 10, active: true },
      { label: "OK", count: 5 },
      { label: "Warning", count: 2, color: "var(--color-warning)" },
      { label: "Exceeded", count: 3, color: "var(--color-error)" },
    ],
    selectLabel: "Last active",
    selectOptions: [
      { label: "any time", value: "any" },
      { label: "last 15 min", value: "15m" },
      { label: "last hour", value: "1h" },
    ],
  },
};
