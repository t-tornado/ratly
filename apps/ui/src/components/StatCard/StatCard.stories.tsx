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

export const Warning: Story = {
  args: {
    label: "Near limit (\u2265 90%)",
    value: "4.7%",
    sub: "61 users \u00b7 9 of them exceeded",
    accent: "warning",
  },
};

export const Error: Story = {
  args: {
    label: "429s today",
    value: "14",
    sub: "last at 13:02:11",
    accent: "error",
  },
};

export const Success: Story = {
  args: {
    label: "Healthy endpoints",
    value: "98.2%",
    sub: "all systems nominal",
    accent: "success",
  },
};
