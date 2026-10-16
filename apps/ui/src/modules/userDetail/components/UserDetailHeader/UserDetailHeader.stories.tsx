import type { Meta, StoryObj } from "@storybook/react-vite";
import { MemoryRouter } from "react-router-dom";
import { UserDetailHeader } from ".";

const meta = {
  component: UserDetailHeader,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
} satisfies Meta<typeof UserDetailHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    userId: "usr_3e88d1",
    status: "status-warning",
    statusLabel: "Warning",
    isStreaming: true,
    actions: [
      { label: "Reset window", variant: "destructive-ghost" },
      { label: "Adjust limit", variant: "ghost" },
    ],
  },
};

export const Healthy: Story = {
  args: {
    userId: "usr_a1b2c3",
    status: "status-ok",
    statusLabel: "OK",
    isStreaming: false,
  },
};

export const Exceeded: Story = {
  args: {
    userId: "usr_ff0011",
    status: "status-exceeded",
    statusLabel: "Exceeded",
    isStreaming: false,
    actions: [
      { label: "Reset window", variant: "destructive-ghost" },
      { label: "Adjust limit", variant: "ghost" },
    ],
  },
};
