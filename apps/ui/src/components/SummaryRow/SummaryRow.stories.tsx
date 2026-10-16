import type { Meta, StoryObj } from "@storybook/react-vite";
import { SummaryRow } from ".";

const meta = {
  component: SummaryRow,
  tags: ["autodocs"],
} satisfies Meta<typeof SummaryRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    items: [
      { label: "Total users", value: "1,284", sub: "312 active in last 15 min" },
      { label: "Near limit (≥ 90%)", value: "4.7%", sub: "61 users · 9 of them exceeded" },
      { label: "429s today", value: "3,907", sub: "since 00:00 UTC" },
      { label: "Admin overrides", value: "3", sub: "custom limits, bonuses, pauses" },
    ],
  },
};
