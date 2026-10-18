import type { Meta, StoryObj } from "@storybook/react-vite";
import { EmptyState } from ".";

const meta = {
  component: EmptyState,
  tags: ["autodocs"],
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const CustomMessage: Story = {
  args: {
    message: "No users found for the selected time window.",
  },
};
