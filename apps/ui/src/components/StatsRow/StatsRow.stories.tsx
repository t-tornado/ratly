import type { Meta, StoryObj } from "@storybook/react-vite";
import { StatsRow } from ".";

const meta = {
  component: StatsRow,
  tags: ["autodocs"],
} satisfies Meta<typeof StatsRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    items: [
      { label: "Remaining", value: "6 / 100" },
      { label: "Resets in", value: "4m 02s", sub: "at 14:21:07 · full 100 back" },
      { label: "Current window", value: "13:21 → 14:21", sub: "94 used · limit 100 · extra 0" },
      { label: "Last reset", value: "13:21:07", sub: "automatic · window rolled over" },
      { label: "429s today", value: "14", sub: "last at 13:02:11" },
    ],
  },
};
