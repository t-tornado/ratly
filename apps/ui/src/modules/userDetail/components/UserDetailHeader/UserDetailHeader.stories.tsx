import type { Meta, StoryObj } from "@storybook/react-vite";
import { UserDetailHeader } from ".";

const meta = {
  component: UserDetailHeader,
  tags: ["autodocs"],
} satisfies Meta<typeof UserDetailHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    userId: "usr_3e88d1",
    status: "status-warning",
    statusLabel: "Warning",
    isStreaming: true,
    isThrottling: false,
    currentLimit: 100,
    currentRemaining: 42,
  },
};

export const Healthy: Story = {
  args: {
    userId: "usr_a1b2c3",
    status: "status-ok",
    statusLabel: "OK",
    isStreaming: false,
    isThrottling: false,
    currentLimit: 500,
    currentRemaining: 480,
  },
};

export const Exceeded: Story = {
  args: {
    userId: "usr_ff0011",
    status: "status-exceeded",
    statusLabel: "Exceeded",
    isStreaming: false,
    isThrottling: true,
    currentLimit: 100,
    currentRemaining: 0,
  },
};
