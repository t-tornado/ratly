import type { Meta, StoryObj } from "@storybook/react-vite";
import { StatCard } from ".";

const meta = {
  component: StatCard,
  tags: ["autodocs"],
} satisfies Meta<typeof StatCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Total users",
    value: "1,284",
    sub: "312 active in last 15 min",
  },
};

export const Percentage: Story = {
  args: {
    label: "Near limit (≥ 90%)",
    value: "4.7%",
    sub: "61 users · 9 of them exceeded",
  },
};
