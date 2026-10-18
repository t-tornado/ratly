import type { Meta, StoryObj } from "@storybook/react-vite";
import { DashboardHeader } from ".";

const meta = {
  component: DashboardHeader,
  tags: ["autodocs"],
  args: { isError: false, onRetry: () => {} },
} satisfies Meta<typeof DashboardHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Connected: Story = {
  args: { isConnected: true },
};

export const Disconnected: Story = {
  args: { isConnected: false },
};

export const FetchError: Story = {
  args: { isConnected: false, isError: true },
};
