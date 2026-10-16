import type { Meta, StoryObj } from "@storybook/react-vite";
import { AlertBanner } from ".";

const meta = {
  component: AlertBanner,
  tags: ["autodocs"],
} satisfies Meta<typeof AlertBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Warning: Story = {
  args: {
    variant: "warning",
    message:
      "Live updates paused. Reconnecting (attempt 3, next in 8s)… Numbers below are from 14:15:40.",
    action: { label: "Retry now" },
  },
};

export const Error: Story = {
  args: {
    variant: "error",
    message: "Connection lost. Data may be stale.",
  },
};
